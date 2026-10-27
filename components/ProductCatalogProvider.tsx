"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as baseProducts, type Product } from "@/data/products";

type ProductCatalogState = {
  products: Product[];
  customProducts: Product[];
  loaded: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, update: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
};

const ProductCatalogContext = createContext<ProductCatalogState | null>(null);
const STORAGE_KEY = "saj-catalog-products-v1";
const categories: Product["category"][] = ["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets", "Sets"];

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Product>;
  return typeof item.id === "string" && typeof item.name === "string" &&
    categories.includes(item.category as Product["category"]) && Number.isFinite(item.price) &&
    typeof item.image === "string" && typeof item.material === "string" &&
    typeof item.style === "string" && Array.isArray(item.occasions) && typeof item.available === "boolean";
}

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<Product>>>({});
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setCustomProducts(parsed.filter(isProduct));
        else if (parsed && typeof parsed === "object") {
          const saved = parsed as { customProducts?: unknown; overrides?: unknown };
          if (Array.isArray(saved.customProducts)) setCustomProducts(saved.customProducts.filter(isProduct));
          if (saved.overrides && typeof saved.overrides === "object" && !Array.isArray(saved.overrides)) setOverrides(saved.overrides as Record<string, Partial<Product>>);
        }
      }
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
    }
    fetch("/api/products", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(result => {
        if (active && result?.configured && Array.isArray(result.products)) setRemoteProducts(result.products.filter(isProduct));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded || remoteProducts) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ customProducts, overrides })); } catch { /* Keep the in-memory catalog usable if storage is full. */ }
  }, [customProducts, overrides, loaded, remoteProducts]);

  const value = useMemo<ProductCatalogState>(() => ({
    products: remoteProducts || [...baseProducts.map(product => ({ ...product, ...overrides[product.id] })), ...customProducts.map(product => ({ ...product, ...overrides[product.id] }))],
    customProducts: remoteProducts ? remoteProducts.filter(product => !baseProducts.some(base => base.id === product.id)) : customProducts,
    loaded,
    addProduct: async product => {
      if (remoteProducts) {
        const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) });
        if (!response.ok) throw new Error((await response.json()).message || "Could not save the product.");
        setRemoteProducts(current => [product, ...(current || []).filter(item => item.id !== product.id)]);
      } else setCustomProducts(current => [product, ...current.filter(item => item.id !== product.id)]);
    },
    updateProduct: async (productId, update) => {
      const currentProducts = remoteProducts || [...baseProducts.map(product => ({ ...product, ...overrides[product.id] })), ...customProducts.map(product => ({ ...product, ...overrides[product.id] }))];
      const currentProduct = currentProducts.find(product => product.id === productId);
      if (!currentProduct) throw new Error("Product no longer exists.");
      const updated = { ...currentProduct, ...update };
      if (remoteProducts) {
        const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
        if (!response.ok) throw new Error((await response.json()).message || "Could not update the product.");
        setRemoteProducts(current => (current || []).map(product => product.id === productId ? updated : product));
      } else if (customProducts.some(product => product.id === productId)) {
        setCustomProducts(current => current.map(product => product.id === productId ? updated : product));
      } else setOverrides(current => ({ ...current, [productId]: { ...current[productId], ...update } }));
    },
    removeProduct: async productId => {
      if (remoteProducts) {
        const response = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, { method: "DELETE" });
        if (!response.ok) throw new Error((await response.json()).message || "Could not remove the product.");
        setRemoteProducts(current => (current || []).filter(item => item.id !== productId));
      } else {
        setCustomProducts(current => current.filter(item => item.id !== productId));
        setOverrides(current => { const next = { ...current }; delete next[productId]; return next; });
      }
    },
  }), [customProducts, overrides, remoteProducts, loaded]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const value = useContext(ProductCatalogContext);
  if (!value) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return value;
}
