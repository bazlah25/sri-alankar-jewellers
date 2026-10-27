import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import ProductFilters from "@/components/ProductFilters";
import { StorefrontHeroImage } from "@/components/StorefrontImages";

const categoryPages = {
  necklaces: {
    name: "Necklaces",
    subtitle: "Silver necklaces to layer, love, and make your own.",
    image: "photo-1599643478518-a784e5dc4c8f",
  },
  rings: {
    name: "Rings",
    subtitle: "Thoughtful silver rings for every day and every occasion.",
    image: "photo-1605100804763-247f67b3557e",
  },
  earrings: {
    name: "Earrings",
    subtitle: "From subtle silver studs to pieces that catch the light.",
    image: "photo-1630019852942-f89202989a59",
  },
  bracelets: {
    name: "Bracelets",
    subtitle: "A little silver detail to stay close, wherever you go.",
    image: "photo-1611652022419-a9419f74343d",
  },
  anklets: {
    name: "Anklets",
    subtitle: "Delicate silver finishing touches, made for your moments.",
    image: "photo-1617038220319-276d3cfab638",
  },
  sets: {
    name: "Sets",
    subtitle: "Thoughtfully matched silver jewellery, ready to wear together.",
    image: "photo-1617038260897-41a1f14a8ca0",
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
        <StorefrontHeroImage imageKey={`category:${category}`} fallbackSrc={`https://images.unsplash.com/${page.image}?auto=format&fit=crop&w=2000&q=85`} alt={`${page.name} in silver`} priority />
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
