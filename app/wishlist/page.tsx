"use client";

import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/components/ShopProvider";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

export default function WishlistPage() {
  const { wishlist } = useShop();
  const { products: catalogProducts } = useProductCatalog();
  const savedProducts = catalogProducts.filter(product => wishlist.includes(product.id));

  return <main className="sa-page sa-wishlist-page">
    <SiteHeader />
    <header className="sa-basket-heading"><span className="sa-eyebrow">SAVED FOR LATER</span><h1>Your wishlist</h1><p>{savedProducts.length} {savedProducts.length === 1 ? "piece" : "pieces"} saved</p></header>
    {savedProducts.length ? <section className="sa-wishlist-products" aria-label="Wishlist products"><div className="sa-products-grid">{savedProducts.map(product => <ProductCard key={product.id} product={product}/>)}</div></section> : <section className="sa-basket-empty"><p>Your wishlist is empty. Save the pieces you love with the heart icon.</p><Link className="sa-button sa-button-dark" href="/jewellery">DISCOVER JEWELLERY</Link></section>}
    <SiteFooter />
  </main>;
}
