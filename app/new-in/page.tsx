import Image from "next/image";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductFilters from "@/components/ProductFilters";
import { products } from "@/data/products";

export const metadata = {
  title: "New In | Sri Alankar Jewellers",
  description: "Discover the latest silver jewellery from Sri Alankar Jewellers.",
};

export default function NewInPage() {
  const newProducts = products.filter(product => product.isNew);

  return (
    <main className="sa-page">
      <SiteHeader />
      <section className="sa-page-hero sa-jewellery-hero">
        <Image src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=85" alt="New silver jewellery arrivals" fill priority sizes="100vw" unoptimized />
        <div className="sa-page-hero-wash" />
        <div className="sa-page-hero-copy"><span className="sa-eyebrow">FRESH FROM THE ATELIER</span><h1>New <em>In</em></h1><p>Discover the latest silver pieces, made for your moments.</p></div>
      </section>
      <section className="sa-page-section sa-shop-all">
        <div className="sa-section-heading"><div><h2>Just Arrived</h2><p>The newest additions to Sri Alankar Jewellers.</p></div></div>
        {newProducts.length ? <ProductFilters products={newProducts} initialCategory="All" showCategoryPills={false}/> : <div className="sa-empty"><h2>New pieces are coming soon</h2><p>Check back soon for our latest silver designs.</p></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
