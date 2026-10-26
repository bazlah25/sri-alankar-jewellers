import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, Heart, Sparkles } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata = {
  title: "About Us | Sri Alankar Jewellers",
  description: "Discover the Sri Alankar Jewellers point of view: considered silver jewellery for everyday moments and the occasions that matter."
};

export default function AboutPage() {
  return <main className="sa-page sa-about-page">
    <SiteHeader />
    <section className="sa-about-hero">
      <Image src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2200&q=88" alt="A close view of thoughtfully styled silver jewellery" fill priority sizes="100vw" unoptimized />
      <div className="sa-about-hero-wash" />
      <div className="sa-about-hero-copy"><span className="sa-eyebrow">SRI ALANKAR JEWELLERS</span><h1>Silver beyond<br/><em>occasions.</em></h1><p>Thoughtful jewellery for the everyday, and all the moments that make it yours.</p></div>
    </section>

    <section className="sa-about-intro"><span className="sa-eyebrow">SRI ALANKAR JEWELLERS</span><h2>Meaning lives in the little things.</h2><p>A familiar necklace before a busy day. A gift chosen with someone in mind. A piece that feels like you, wherever you’re headed. Sri Alankar Jewellers brings together considered silver jewellery for those moments, with designs made to feel personal, wearable, and easy to return to.</p></section>

    <section className="sa-about-story">
      <div className="sa-about-story-image"><Image src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=88" alt="A delicate necklace styled for everyday wear" fill sizes="(max-width: 700px) 100vw, 50vw" unoptimized /></div>
      <div className="sa-about-story-copy"><span className="sa-eyebrow">MADE FOR YOUR MOMENTS</span><h2>Easy to wear.<br/>Meaningful to keep.</h2><p>We believe the pieces you reach for most should feel special without waiting for a special occasion. Our collections bring together clean lines, delicate details, and expressive designs that work on their own or layered your way.</p><p>From everyday favourites to thoughtful gifts, each edit is designed to help you find a piece that fits your style and the moment you’re marking.</p><Link className="sa-about-text-link" href="/collections">DISCOVER OUR COLLECTIONS <ArrowRight size={15}/></Link></div>
    </section>

    <section className="sa-about-values"><div className="sa-about-values-heading"><span className="sa-eyebrow">WHAT MATTERS TO US</span><h2>Thoughtful by design.</h2></div><div className="sa-about-value-grid">
      <article><Gem size={24}/><h3>Considered materials</h3><p>Product pages clearly identify 925 sterling silver and silver-plated designs, so you can choose with confidence.</p></article>
      <article><Heart size={24}/><h3>Made to feel personal</h3><p>From subtle everyday pieces to statement styles, find jewellery that feels true to your taste.</p></article>
      <article><Sparkles size={24}/><h3>For all your moments</h3><p>Explore versatile designs for daily wear, celebrations, and meaningful gifts.</p></article>
    </div></section>

    <section className="sa-about-materials"><div><span className="sa-eyebrow">A CLEARER CHOICE</span><h2>Know what you’re choosing.</h2><p>Materials vary by design. We distinguish solid 925 sterling silver from silver-plated jewellery on product details, and encourage you to check each piece before adding it to your collection.</p><Link className="sa-about-text-link" href="/jewellery">SHOP ALL JEWELLERY <ArrowRight size={15}/></Link></div><Image src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=88" alt="A detailed silver ring" width={900} height={1100} unoptimized /></section>

    <section className="sa-about-cta"><span className="sa-eyebrow">FIND YOUR EVERYDAY FAVOURITE</span><h2>A little silver, a lot of meaning.</h2><Link className="sa-button sa-button-dark" href="/jewellery">SHOP JEWELLERY <ArrowRight size={15}/></Link></section>
    <SiteFooter />
  </main>;
}
