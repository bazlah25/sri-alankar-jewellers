"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as baseProducts, type Product } from "@/data/products";

type ProductCatalogState = {
  products: Product[];
  customProducts: Product[];
  loaded: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, update: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ customProducts, overrides })); } catch { /* Keep the in-memory catalog usable if storage is full. */ }
  }, [customProducts, overrides, loaded]);

  const value = useMemo<ProductCatalogState>(() => ({
    products: [...baseProducts.map(product => ({ ...product, ...overrides[product.id] })), ...customProducts.map(product => ({ ...product, ...overrides[product.id] }))],
    customProducts,
    loaded,
    addProduct: product => setCustomProducts(current => [product, ...current.filter(item => item.id !== product.id)]),
    updateProduct: (productId, update) => setOverrides(current => ({ ...current, [productId]: { ...current[productId], ...update } })),
    removeProduct: productId => {
      setCustomProducts(current => current.filter(item => item.id !== productId));
      setOverrides(current => { const next = { ...current }; delete next[productId]; return next; });
    },
  }), [customProducts, overrides, loaded]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const value = useContext(ProductCatalogContext);
  if (!value) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return value;
}
