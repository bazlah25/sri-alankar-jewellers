"use client";

import ProductCard from "@/components/ProductCard";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

export default function CollectionProductGrid({ collectionSlug }: { collectionSlug: string }) {
  const { products: catalogProducts } = useProductCatalog();
  const collectionProducts = catalogProducts.filter(product => product.collectionSlugs.includes(collectionSlug));
  return collectionProducts.length ? <div className="sa-products-grid">{collectionProducts.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <p>New pieces are coming soon.</p>;
}
