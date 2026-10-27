"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

const budgets = [
  { label: "All gifts", value: "all" },
  { label: "Under ₹2,000", value: "under-2000" },
  { label: "₹2,000–₹3,000", value: "2000-3000" },
  { label: "Above ₹3,000", value: "above-3000" },
];

export default function GiftsCatalog() {
  const [budget, setBudget] = useState("all");
  const { products: catalogProducts } = useProductCatalog();
  const allGiftProducts = useMemo(() => catalogProducts.filter(product => product.occasions.includes("Gifting") || product.collectionSlugs.includes("gifting-edit")), [catalogProducts]);
  const filtered = useMemo(() => allGiftProducts.filter(product => {
    if (budget === "under-2000") return product.price < 2000;
    if (budget === "2000-3000") return product.price >= 2000 && product.price <= 3000;
    if (budget === "above-3000") return product.price > 3000;
    return true;
  }), [allGiftProducts, budget]);

  return <>
    <nav className="sa-gift-budget-filter" aria-label="Filter gifts by budget">
      {budgets.map(option => <button key={option.value} type="button" className={budget === option.value ? "active" : ""} aria-pressed={budget === option.value} onClick={() => setBudget(option.value)}>{option.label}</button>)}
    </nav>
    <div className="sa-gift-results-heading"><span>{filtered.length} thoughtful {filtered.length === 1 ? "pick" : "picks"}</span><span>925 sterling silver &amp; silver-plated designs</span></div>
    {filtered.length ? <div className="sa-products-grid">{filtered.map(product => <ProductCard key={product.id} product={product}/>)}</div> : <div className="sa-empty"><h2>More gifts are on the way</h2><p>Try another price range to see the rest of the collection.</p></div>}
  </>;
}
