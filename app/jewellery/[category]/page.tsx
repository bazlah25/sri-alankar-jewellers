import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductFilters from "@/components/ProductFilters";
import { StorefrontHeroImage } from "@/components/StorefrontImages";

const categoryPages = {
  necklaces: {
    name: "Necklaces",
    subtitle: "Silver necklaces to layer, love, and make your own.",
  },
  rings: {
    name: "Rings",
    subtitle: "Thoughtful silver rings for every day and every occasion.",
  },
  earrings: {
    name: "Earrings",
    subtitle: "From subtle silver studs to pieces that catch the light.",
  },
  bracelets: {
    name: "Bracelets",
    subtitle: "A little silver detail to stay close, wherever you go.",
  },
  "photo-frames": {
    name: "Photo Frames",
    subtitle: "Silver frames for the moments and people you want to keep close.",
  },
  "pooja-essentials": {
    name: "Pooja Essentials",
    subtitle: "Silver essentials for meaningful rituals and celebrations.",
  },
} as const;

type CategorySlug = keyof typeof categoryPages;

export function generateStaticParams() {
  return Object.keys(categoryPages).map(category => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const page = categoryPages[category as CategorySlug];
  return { title: page ? `${page.name} | Sri Alankar Jewellers` : "Jewellery | Sri Alankar Jewellers" };
}

export default async function JewelleryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const page = categoryPages[category as CategorySlug];
  if (!page) notFound();
  return (
    <main className="sa-page">
      <SiteHeader />
      <section className="sa-page-hero sa-jewellery-hero">
        <StorefrontHeroImage imageKey={`category:${category}`} alt={`${page.name} in silver`} priority />
        <div className="sa-page-hero-wash" />
        <div className="sa-page-hero-copy">
          <h1>Explore Our<br /><em>{page.name}</em></h1>
          <p>{page.subtitle}</p>
        </div>
      </section>
      <section className="sa-page-section sa-detail-products">
        <div className="sa-section-heading"><div><span className="sa-eyebrow">MADE FOR YOUR MOMENTS</span><h2>{page.name}</h2></div></div>
        <ProductFilters initialCategory={page.name} showCategoryPills={false}/>
      </section>
      <SiteFooter />
    </main>
  );
}
