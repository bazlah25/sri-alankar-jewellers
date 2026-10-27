import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductFilters from "@/components/ProductFilters";
import { StorefrontHeroImage } from "@/components/StorefrontImages";

export const metadata = {
  title: "Shop Jewellery | Sri Alankar Jewellers",
  description: "Explore silver necklaces, earrings, rings, bracelets, anklets, and jewellery sets."
};

export default async function JewelleryPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || "All";
  const initialSort = params.sort || "Featured";

  return (
    <main className="sa-page">
      <SiteHeader/>
      <section className="sa-page-hero sa-jewellery-hero">
        <StorefrontHeroImage imageKey="all-jewellery" fallbackSrc="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=85" alt="Silver jewellery collection" priority />
        <div className="sa-page-hero-wash"/>
        <div className="sa-page-hero-copy"><span className="sa-eyebrow">THE SILVER EDIT</span><h1>Explore Our<br/><em>Jewellery</em></h1><p>Timeless silver. Made to be yours.</p></div>
      </section>

      <section className="sa-page-section sa-shop-all" id="shop-all">
        <ProductFilters initialCategory={initialCategory} initialSort={initialSort}/>
      </section>

      <section className="sa-complete-look"><div><span className="sa-eyebrow">A LITTLE INSPIRATION</span><h2>Complete the Look</h2><p>Find pieces that feel beautiful together.</p></div><Link className="sa-button sa-button-outline" href="/collections/silver-wardrobe">EXPLORE MATCHING PIECES <ArrowRight size={15}/></Link></section>
    <SiteFooter/>
    </main>
  );
}
