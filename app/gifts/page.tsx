import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Heart, PackageCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import GiftsCatalog from "@/components/GiftsCatalog";

export const metadata = {
  title: "Gifts | Sri Alankar Jewellers",
  description: "Find a thoughtful silver jewellery gift for birthdays, celebrations, and everyday moments."
};

const giftCategories = [
  { name: "Necklaces", line: "A keepsake close to the heart", href: "/jewellery/necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85" },
  { name: "Earrings", line: "Little details, lasting delight", href: "/jewellery/earrings", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85" },
  { name: "Jewellery sets", line: "A beautifully matched gesture", href: "/jewellery/sets", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=85" },
];

export default function GiftsPage() {
  return <main className="sa-page sa-gifts-page">
    <SiteHeader />
    <section className="sa-gifts-hero">
      <Image src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=2200&q=88" alt="A carefully wrapped gift ready to give" fill priority sizes="100vw" unoptimized />
      <div className="sa-gifts-hero-wash" />
      <div className="sa-gifts-hero-copy"><span className="sa-eyebrow">A LITTLE SOMETHING MEANINGFUL</span><h1>Gifts that<br/><em>speak from the heart.</em></h1><p>Thoughtful silver jewellery for birthdays, celebrations, and all the moments worth remembering.</p><Link className="sa-button sa-button-dark" href="#gift-picks">FIND A GIFT <ArrowRight size={15}/></Link></div>
    </section>

    <section className="sa-gifts-intro"><span className="sa-eyebrow">SRI ALANKAR JEWELLERS</span><h2>Make their moment memorable.</h2><p>Choose a piece that feels like them: a delicate everyday favourite, a little sparkle for a celebration, or a matching set made to be treasured.</p></section>

    <section className="sa-gift-promises" aria-label="Gift details"><div><Gift/><strong>THOUGHTFUL PICKS</strong><span>Considered designs for every style</span></div><div><PackageCheck/><strong>GIFT-READY PACKAGING</strong><span>Prepared with care for giving</span></div><div><Heart/><strong>MADE TO BE KEPT</strong><span>Silver for moments big and small</span></div></section>

    <section className="sa-gift-category-section"><div className="sa-section-heading"><div><span className="sa-eyebrow">FIND THEIR KIND OF SILVER</span><h2>Shop by style</h2></div><Link className="sa-text-link" href="/collections/gifting-edit">GIFTING EDIT <ArrowRight size={14}/></Link></div><div className="sa-gift-category-grid">{giftCategories.map(category => <Link href={category.href} key={category.name} className="sa-gift-category-card"><div><Image src={category.image} alt={category.name} fill sizes="(max-width: 700px) 90vw, 32vw" unoptimized/><span className="sa-gift-category-arrow"><ArrowRight size={16}/></span></div><h3>{category.name}</h3><p>{category.line}</p></Link>)}</div></section>

    <section className="sa-gifts-catalog" id="gift-picks"><div className="sa-section-heading"><div><span className="sa-eyebrow">A THOUGHTFUL PLACE TO START</span><h2>Gift-worthy silver</h2><p>Browse pieces selected from our gifting collection, then refine by budget.</p></div></div><GiftsCatalog/></section>
    <section className="sa-gifts-note"><p>“The best gifts feel like you thought of them.”</p><span className="sa-eyebrow">SRI ALANKAR JEWELLERS</span><Link className="sa-button sa-button-outline" href="/collections/gifting-edit">EXPLORE THE GIFTING EDIT <ArrowRight size={15}/></Link></section>
    <SiteFooter />
  </main>;
}
