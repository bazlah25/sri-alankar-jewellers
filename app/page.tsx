"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/data/products";
import { useProductCatalog } from "@/components/ProductCatalogProvider";
import { StorefrontHeroImage } from "@/components/StorefrontImages";
import {
  ArrowRight, Search, UserRound, Heart, ShoppingBag,
  Menu, X, Play, Instagram, ChevronRight
} from "lucide-react";

const categories = [
  { name: "Necklace", href: "/jewellery/necklaces", image: "/categories/necklace-category.jpg" },
  { name: "Earrings", href: "/jewellery/earrings", image: "/categories/earrings-category.jpg" },
  { name: "Rings", href: "/jewellery/rings", image: "/categories/rings-category.jpg" },
  { name: "Bracelets", href: "/jewellery/bracelets", image: "/categories/bracelet-category.jpg" },
  { name: "Photo Frames", href: "/jewellery/photo-frames", image: "/categories/photo-frames-category.jpg" },
  { name: "Pooja Essentials", href: "/jewellery/pooja-essentials", image: "/categories/pooja-essentials-category.jpg" },
];

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`photo ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 700px) 50vw, 25vw" unoptimized />
    </div>
  );
}

export default function HomePage() {
  const { products: catalogProducts } = useProductCatalog();
  const { wishlist, toggleWishlist, cartCount, addToCart } = useShop();
  const products = catalogProducts.filter(product => product.isBestseller || product.isNew).slice(0, 5);
  const [menuOpen, setMenuOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const jewelleryMenuRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!jewelleryMenuRef.current?.contains(event.target as Node)) setJewelleryOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setJewelleryOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <main>
      <div className="announcement">
        <span>CERTIFIED 925 SILVER</span>
      </div>

      <header className="header">
        <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <a href="/" className="wordmark logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} priority className="brand-logo" /></a>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/new-in">New In</a>
          <div className="nav-dropdown" ref={jewelleryMenuRef}>
            <button className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={jewelleryOpen} onClick={() => setJewelleryOpen(!jewelleryOpen)}>Jewellery</button>
            {jewelleryOpen && <div className="nav-dropdown-menu" role="menu">
              {[['All', '/jewellery'], ['Necklace', '/jewellery/necklaces'], ['Earrings', '/jewellery/earrings'], ['Rings', '/jewellery/rings'], ['Bracelets', '/jewellery/bracelets'], ['Photo Frames', '/jewellery'], ['Pooja Essentials', '/jewellery']].map(([label, href]) => <a role="menuitem" key={label} href={href} onClick={() => { setJewelleryOpen(false); setMenuOpen(false); }}>{label}</a>)}
            </div>}
          </div>
          <a href="/collections">Collections</a>
          <a href="/gifts">Gifts</a>
          <a href="/about">About</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={20} /></button>
          <button className="icon-button" aria-label="Account" onClick={() => setNotice("Customer accounts can be connected when you add your ecommerce backend.")}><UserRound size={20} /></button>
          <Link className="icon-button count-link" aria-label={`Wishlist, ${wishlist.length} saved`} href="/wishlist"><Heart size={20}/>{wishlist.length > 0 && <span>{wishlist.length}</span>}</Link>
          <Link className="icon-button bag-button count-link" aria-label={`Shopping bag, ${cartCount} items`} href="/cart"><ShoppingBag size={20}/><span>{cartCount}</span></Link>
        </div>
      </header>

      {searchOpen && (
        <form className="search-panel" action="/search" method="get">
          <Search size={18} />
          <input autoFocus name="q" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search silver jewellery..." aria-label="Search silver jewellery" />
          <button className="search-submit" type="submit">SEARCH</button>
          <button className="icon-button" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
        </form>
      )}
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}

      <section className="hero">
        <StorefrontHeroImage imageKey="home" alt="Silver jewellery campaign" priority className="home" />
        <div className="hero-wash" />
        <div className="hero-copy">
          <p className="eyebrow">SRI ALANKAR JEWELLERS</p>
          <h1>Exclusive Jewels,<br /><em>Exclusive You.</em></h1>
          <p className="hero-description">Timeless pieces for everyday moments,<br className="desktop-break" /> special milestones, and everything in between.</p>
          <a className="button button-dark" href="#signature">SHOP THE COLLECTION <ArrowRight size={16}/></a>
        </div>
        <p className="hero-script">More than<br />Jewellery ♡</p>
      </section>

      <section className="section category-section" id="categories">
        <div className="section-heading">
          <h2>Shop by Category</h2>
          <a href="#signature">EXPLORE ALL <ArrowRight size={15}/></a>
        </div>
        <div className="category-grid">
          {categories.map(category => (
            <a className="category-card" href={category.href} key={category.name}>
              <Photo src={category.image} alt={category.name} />
              <span>{category.name}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="signature" id="signature">
        <div className="section">
          <div className="section-heading product-heading">
            <div><h2>The Signature Collection</h2><p>Minimal designs. Maximum meaning.</p></div>
            <a href="#new">VIEW ALL <ArrowRight size={15}/></a>
          </div>
          <div className="product-grid">
            {products.map(product => (
              <article className="product-card" key={product.name}>
                <div className="product-image-wrap">
                  <a className="home-product-link" href={`/products/${product.id}`} aria-label={`View ${product.name}`}><Photo src={product.image} alt={product.name} /></a>
                  {product.isBestseller && <span className="product-tag">BESTSELLER</span>}
                  <button className={`favorite ${wishlist.includes(product.id) ? "is-favorite" : ""}`} aria-label={`Toggle ${product.name} wishlist`} aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product.id)}>
                    <Heart size={18} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="product-meta"><a href={`/products/${product.id}`}>{product.name}</a><span>{formatPrice(product.price)}</span></div>
                <button className="quick-add" onClick={() => { addToCart(product.id); setNotice(`${product.name} added to your bag.`); }}>QUICK ADD <span>+</span></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="story-image">
          <Image src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=85" alt="Jewellery craftsmanship" fill sizes="(max-width: 700px) 100vw, 33vw" unoptimized />
          <button className="play-button" aria-label="Play our story video" onClick={() => setNotice("Add your brand story video here when it is ready.")}><Play size={24} fill="currentColor"/></button>
        </div>
        <div className="story-copy">
          <p className="eyebrow">OUR STORY</p>
          <h2>Crafted with Care,<br />Made for Generations</h2>
          <p>Our jewellery is crafted in 925 sterling silver, designed to be cherished today and passed on tomorrow. Each piece blends timeless craftsmanship with modern minimalism.</p>
          <a className="button button-outline" href="#footer">DISCOVER OUR STORY <ArrowRight size={15}/></a>
        </div>
        <div className="story-detail">
          <Image src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=85" alt="Silver ring detail" fill sizes="(max-width: 700px) 100vw, 25vw" unoptimized />
        </div>
      </section>

      <section className="gift-banner" id="gifts">
        <Image src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1800&q=85" alt="Thoughtful gift packaging" fill sizes="100vw" unoptimized />
        <div className="gift-overlay" />
        <div className="gift-copy">
          <p className="eyebrow">A LITTLE SOMETHING MEANINGFUL</p>
          <h2>Gifts that<br />Speak from the Heart</h2>
          <p>Thoughtful silver jewellery for every occasion.</p>
          <a className="button button-outline" href="/gifts">EXPLORE GIFTS <ArrowRight size={15}/></a>
        </div>
      </section>

      <section className="newsletter">
        <p className="eyebrow">A NOTE FROM SRI ALANKAR JEWELLERS</p>
        <h2>Good things, in silver.</h2>
        <p>Be first to discover new pieces, thoughtful gifts, and little stories.</p>
        <form onSubmit={(event) => { event.preventDefault(); setNotice("Thank you for joining the Sri Alankar Jewellers mailing list demo."); }}>
          <input type="email" required placeholder="Your email address" aria-label="Your email address" />
          <button type="submit">JOIN US <ArrowRight size={15}/></button>
        </form>
      </section>

      <footer className="footer" id="footer">
        <div><a href="/" className="wordmark logo-link footer-logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} className="brand-logo" /></a><p>Exclusive jewels, exclusive you.</p></div>
        <div><strong>EXPLORE</strong><a href="/new-in">New In</a><a href="/jewellery">Jewellery</a><a href="/collections">Collections</a><a href="/gifts">Gifts</a></div>
        <div><strong>HELP</strong><span className="footer-static-link">Shipping &amp; Returns</span><span className="footer-static-link">Care Guide</span><span className="footer-static-link">Contact Us</span></div>
        <div><strong>FOLLOW ALONG</strong><span className="footer-static-link"><Instagram size={16}/> Instagram</span><span className="footer-static-link">Privacy &amp; Terms</span></div>
        <div className="copyright">© 2026 Sri Alankar Jewellers. Demo storefront — replace placeholder content and connect ecommerce services before launch.</div>
      </footer>
    </main>
  );
}
