"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products as baseProducts, type Product } from "@/data/products";

type ProductCatalogState = {
  products: Product[];
  customProducts: Product[];
  loaded: boolean;
  databaseConfigured: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, update: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
};

const ProductCatalogContext = createContext<ProductCatalogState | null>(null);
const categories: Product["category"][] = ["Necklaces", "Earrings", "Rings", "Bracelets", "Photo Frames", "Pooja Essentials"];

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Product>;
  return typeof item.id === "string" && typeof item.name === "string" &&
    categories.includes(item.category as Product["category"]) && Number.isFinite(item.price) &&
    typeof item.image === "string" && typeof item.material === "string" &&
    (!item.images || (Array.isArray(item.images) && item.images.every(image => typeof image === "string"))) &&
    (!item.description || typeof item.description === "string") &&
    (!item.ringSizes || (Array.isArray(item.ringSizes) && item.ringSizes.every(size => typeof size === "string"))) &&
    (!item.tryOnModelUrl || typeof item.tryOnModelUrl === "string") &&
    typeof item.style === "string" && Array.isArray(item.occasions) && typeof item.available === "boolean";
}

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [databaseConfigured, setDatabaseConfigured] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/products", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(result => {
        if (active) setDatabaseConfigured(Boolean(result?.configured));
        if (active && result?.configured && Array.isArray(result.products)) setRemoteProducts(result.products.filter(isProduct));
        else if (active) setRemoteProducts([]);
      })
      .catch(() => { if (active) setRemoteProducts([]); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  const value = useMemo<ProductCatalogState>(() => ({
    products: remoteProducts,
    customProducts: remoteProducts.filter(product => !baseProducts.some(base => base.id === product.id)),
    loaded,
    databaseConfigured,
    addProduct: async product => {
      const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product) });
      if (!response.ok) throw new Error((await response.json()).message || "Could not save the product.");
      setRemoteProducts(current => [product, ...current.filter(item => item.id !== product.id)]);
    },
    updateProduct: async (productId, update) => {
      const currentProduct = remoteProducts.find(product => product.id === productId);
      if (!currentProduct) throw new Error("Product no longer exists.");
      const updated = { ...currentProduct, ...update };
      const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
      if (!response.ok) throw new Error((await response.json()).message || "Could not update the product.");
      setRemoteProducts(current => current.map(product => product.id === productId ? updated : product));
    },
    removeProduct: async productId => {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).message || "Could not remove the product.");
      setRemoteProducts(current => current.filter(item => item.id !== productId));
    },
  }), [remoteProducts, loaded, databaseConfigured]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const value = useContext(ProductCatalogContext);
  if (!value) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return value;
}
