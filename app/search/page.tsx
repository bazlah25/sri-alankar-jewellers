import Image from "next/image";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductFilters from "@/components/ProductFilters";

export const metadata = {
  title: "Search Jewellery | Sri Alankar Jewellers",
  description: "Search the Sri Alankar Jewellers silver collection."
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = (params.q || "").trim();

  return <main className="sa-page">
    <SiteHeader />
    <section className="sa-page-hero sa-search-hero">
      <Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=85" alt="Silver jewellery" fill priority sizes="100vw" unoptimized />
      <div className="sa-page-hero-wash" />
      <div className="sa-page-hero-copy"><span className="sa-eyebrow">FIND YOUR FAVOURITE</span><h1>Search<br/><em>the collection</em></h1><p>{query ? `Results for “${query}”` : "Enter a piece, category, style, or occasion above."}</p></div>
    </section>
    <section className="sa-page-section sa-shop-all">
      {query ? <ProductFilters initialSearch={query} /> : <div className="sa-empty"><h2>What are you looking for?</h2><p>Search by product name, category, material, style, or occasion.</p></div>}
    </section>
    <SiteFooter />
  </main>;
}
