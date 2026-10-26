import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CollectionCard from "@/components/CollectionCard";
import { collections } from "@/data/collections";

export const metadata = {
  title: "Collections | Sri Alankar Jewellers",
  description: "Explore thoughtfully curated silver jewellery collections for everyday wear, celebrations, gifting, and more."
};

export default function CollectionsPage() {
  const [featured, ...rest] = collections;
  return (
    <main className="sa-page">
      <SiteHeader/>
      <section className="sa-collections-hero">
        <Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=85" alt="Sri Alankar silver jewellery editorial" fill priority sizes="100vw" unoptimized />
        <div className="sa-collections-hero-wash"/>
        <div className="sa-collections-hero-copy"><span className="sa-eyebrow">CURATED FOR YOUR MOMENTS</span><h1>Collections<br/><em>with Meaning</em></h1><p>Discover silver pieces that tell your story.</p><Link className="sa-button sa-button-dark" href="#all-collections">DISCOVER OUR EDITS <ArrowRight size={15}/></Link></div>
      </section>

      <section className="sa-page-section sa-collection-intro"><span className="sa-eyebrow">SRI ALANKAR JEWELLERS</span><h2>Find the feeling.<br/><em>Then find your piece.</em></h2><p>From everyday essentials to meaningful gifts, explore curated edits designed around the moments, moods, and memories that make you who you are.</p></section>

      <section className="sa-page-section sa-all-collections" id="all-collections">
        <div className="sa-section-heading"><div><span className="sa-eyebrow">A WORLD OF SILVER</span><h2>Explore Our Collections</h2></div><span className="sa-collection-count">06 EDITS</span></div>
        <div className="sa-collections-grid">
          {featured && <CollectionCard collection={featured} featured/>}
          {rest.map((collection, index) => <CollectionCard key={collection.slug} collection={collection} featured={index === 2}/>)}
        </div>
      </section>

      <section className="sa-collection-quote"><span>“</span><p>Jewellery is more than what you wear.<br/>It is a little piece of who you are.</p><span className="sa-eyebrow">SILVER BEYOND OCCASIONS</span></section>
    <SiteFooter/>
    </main>
  );
}
