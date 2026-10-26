"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, UserRound, Heart, ShoppingBag, Menu, X, Instagram } from "lucide-react";
import { useShop } from "@/components/ShopProvider";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const jewelleryMenuRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const { cartCount, wishlist } = useShop();

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

  return <>
    <div className="announcement"><span className="announcement-arrow">←</span><span>FREE SHIPPING ON ORDERS ABOVE ₹2,999</span><i/><span>EASY RETURNS</span><i/><span>CERTIFIED 925 SILVER</span><span className="announcement-arrow">→</span></div>
    <header className="header">
      <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      <Link href="/" className="wordmark logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} priority className="brand-logo"/></Link>
      <nav className={menuOpen ? "nav nav-open" : "nav"}>
        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/new-in" onClick={() => setMenuOpen(false)}>New In</Link>
        <div className="nav-dropdown" ref={jewelleryMenuRef}>
          <button className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={jewelleryOpen} onClick={() => setJewelleryOpen(!jewelleryOpen)}>Jewellery</button>
          {jewelleryOpen && <div className="nav-dropdown-menu" role="menu">
            {[['All', '/jewellery'], ['Necklaces', '/jewellery/necklaces'], ['Rings', '/jewellery/rings'], ['Earrings', '/jewellery/earrings'], ['Bracelets', '/jewellery/bracelets'], ['Anklets', '/jewellery/anklets'], ['Sets', '/jewellery/sets']].map(([label, href]) => <Link role="menuitem" key={label} href={href} onClick={() => { setJewelleryOpen(false); setMenuOpen(false); }}>{label}</Link>)}
          </div>}
        </div>
        <Link href="/collections" onClick={() => setMenuOpen(false)}>Collections</Link><Link href="/gifts" onClick={() => setMenuOpen(false)}>Gifts</Link><Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={20}/></button>
        <button className="icon-button" aria-label="Account" onClick={() => setNotice("Customer accounts can be connected when you add your ecommerce backend.")}><UserRound size={20}/></button>
        <Link className="icon-button count-link" aria-label={`Wishlist, ${wishlist.length} saved`} href="/wishlist"><Heart size={20}/>{wishlist.length > 0 && <span>{wishlist.length}</span>}</Link>
        <Link className="icon-button bag-button count-link" aria-label={`Shopping bag, ${cartCount} items`} href="/cart"><ShoppingBag size={20}/><span>{cartCount}</span></Link>
      </div>
    </header>
    {searchOpen && <form className="search-panel" action="/search" method="get"><Search size={18}/><input autoFocus name="q" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search silver jewellery..." aria-label="Search silver jewellery"/><button className="search-submit" type="submit">SEARCH</button><button className="icon-button" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18}/></button></form>}
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
  </>;
}

export function SiteFooter() {
  return <footer className="footer" id="footer">
    <div><Link href="/" className="wordmark logo-link footer-logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} className="brand-logo"/></Link><p>Silver Beyond Occasions</p></div>
    <div><strong>EXPLORE</strong><Link href="/new-in">New In</Link><Link href="/jewellery">Jewellery</Link><Link href="/collections">Collections</Link><Link href="/gifts">Gifts</Link><Link href="/about">About</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Shopping bag</Link></div>
    <div><strong>HELP</strong><span className="footer-static-link">Shipping &amp; Returns</span><span className="footer-static-link">Care Guide</span><span className="footer-static-link">Contact Us</span></div>
    <div><strong>FOLLOW ALONG</strong><span className="footer-static-link"><Instagram size={16}/> Instagram</span><span className="footer-static-link">Privacy &amp; Terms</span></div>
    <div className="copyright">© 2026 Sri Alankar Jewellers. Demo storefront — checkout and inventory require a connected ecommerce service.</div>
  </footer>;
}
