"use client";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

export default function CollectionProductGrid({ collectionSlug, products: initialProducts }: { collectionSlug: string; products: Product[] }) {
  const { products: catalogProducts } = useProductCatalog();
  const ids = new Set(initialProducts.map(product => product.id));
  const collectionProducts = catalogProducts.filter(product => ids.has(product.id) || product.collectionSlugs.includes(collectionSlug));
  return collectionProducts.length ? <div className="sa-products-grid">{collectionProducts.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p>New pieces are coming soon.</p>;
}
