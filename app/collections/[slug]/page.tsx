import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { collections } from "@/data/collections";
import { products } from "@/data/products";
import CollectionProductGrid from "@/components/CollectionProductGrid";

export function generateStaticParams() {
  return collections.map(collection => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections.find(item => item.slug === slug);
  return { title: collection ? `${collection.title} | Sri Alankar Jewellers` : "Collection | Sri Alankar Jewellers" };
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections.find(item => item.slug === slug);
  if (!collection) notFound();
  const collectionProducts = products.filter(product => product.collectionSlugs.includes(slug));

  return (
    <main className="sa-page">
      <SiteHeader/>
      <section className="sa-detail-hero">
        <Image src={collection.image} alt={collection.title} fill priority sizes="100vw" unoptimized/>
        <div className="sa-detail-hero-wash"/>
        <div className="sa-detail-hero-copy"><Link href="/collections" className="sa-back-link"><ArrowLeft size={15}/> ALL COLLECTIONS</Link><span className="sa-eyebrow">THE SRI ALANKAR EDIT</span><h1>{collection.title}</h1><p>{collection.tagline}</p></div>
      </section>
      <section className="sa-page-section sa-detail-intro"><p>{collection.intro}</p></section>
      <section className="sa-page-section sa-detail-products"><div className="sa-section-heading"><div><span className="sa-eyebrow">CURATED FOR YOU</span><h2>Discover the Pieces</h2></div><span className="sa-collection-count">{collectionProducts.length} PIECES</span></div>
        <CollectionProductGrid collectionSlug={slug} products={collectionProducts}/>
      </section>
      <div className="sa-back-to-collections"><Link className="sa-button sa-button-outline" href="/collections">EXPLORE ALL COLLECTIONS <ArrowRight size={15}/></Link></div>
    <SiteFooter/>
    </main>
  );
}
