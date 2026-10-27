import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductFilters from "@/components/ProductFilters";
import { StorefrontHeroImage } from "@/components/StorefrontImages";

export const metadata = {
  title: "New In | Sri Alankar Jewellers",
  description: "Discover the latest silver jewellery from Sri Alankar Jewellers.",
};

export default function NewInPage() {
  return (
    <main className="sa-page">
      <SiteHeader />
      <section className="sa-page-hero sa-jewellery-hero">
        <StorefrontHeroImage imageKey="new-in" fallbackSrc="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=85" alt="New silver jewellery arrivals" priority />
        <div className="sa-page-hero-wash" />
        <div className="sa-page-hero-copy"><span className="sa-eyebrow">FRESH FROM THE ATELIER</span><h1>New <em>In</em></h1><p>Discover the latest silver pieces, made for your moments.</p></div>
      </section>
      <section className="sa-page-section sa-shop-all">
        <div className="sa-section-heading"><div><h2>Just Arrived</h2><p>The newest additions to Sri Alankar Jewellers.</p></div></div>
        <ProductFilters initialCategory="All" initialNewOnly showCategoryPills={false}/>
      </section>
      <SiteFooter />
    </main>
  );
}
