"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, UserRound, Heart, ShoppingBag, Menu, X, Instagram } from "lucide-react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const jewelleryMenuRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
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

  return <>
    <div className="announcement"><span className="announcement-arrow">←</span><span>FREE SHIPPING ON ORDERS ABOVE ₹2,999</span><i/><span>EASY RETURNS</span><i/><span>CERTIFIED 925 SILVER</span><span className="announcement-arrow">→</span></div>
    <header className="header">
      <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      <Link href="/" className="wordmark logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} priority className="brand-logo"/></Link>
      <nav className={menuOpen ? "nav nav-open" : "nav"}>
        <Link href="/new-in" onClick={() => setMenuOpen(false)}>New In</Link>
        <div className="nav-dropdown" ref={jewelleryMenuRef}>
          <button className="nav-dropdown-trigger" aria-haspopup="true" aria-expanded={jewelleryOpen} onClick={() => setJewelleryOpen(!jewelleryOpen)}>Jewellery</button>
          {jewelleryOpen && <div className="nav-dropdown-menu" role="menu">
            {[['All', '/jewellery'], ['Necklaces', '/jewellery/necklaces'], ['Rings', '/jewellery/rings'], ['Earrings', '/jewellery/earrings'], ['Bracelets', '/jewellery/bracelets'], ['Anklets', '/jewellery/anklets'], ['Sets', '/jewellery/sets']].map(([label, href]) => <Link role="menuitem" key={label} href={href} onClick={() => { setJewelleryOpen(false); setMenuOpen(false); }}>{label}</Link>)}
          </div>}
        </div>
        <Link href="/collections" onClick={() => setMenuOpen(false)}>Collections</Link><Link href="/collections/gifting-edit" onClick={() => setMenuOpen(false)}>Gifts</Link><Link href="/#story" onClick={() => setMenuOpen(false)}>About</Link>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={20}/></button>
        <button className="icon-button" aria-label="Account" onClick={() => setNotice("Customer accounts can be connected when you add your ecommerce backend.")}><UserRound size={20}/></button>
        <button className="icon-button" aria-label="Wishlist" onClick={() => setNotice("Wishlist is a demo feature on this storefront.")}><Heart size={20}/></button>
        <button className="icon-button bag-button" aria-label="Shopping bag" onClick={() => setNotice("Checkout is a demo feature. Connect an ecommerce service to place orders.")}><ShoppingBag size={20}/><span>0</span></button>
      </div>
    </header>
    {searchOpen && <div className="search-panel"><Search size={18}/><input autoFocus placeholder="Search silver jewellery..." aria-label="Search silver jewellery" onKeyDown={event => { if (event.key === "Enter") window.location.href = `/jewellery?search=${encodeURIComponent(event.currentTarget.value)}`; }}/><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18}/></button></div>}
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}
  </>;
}

export function SiteFooter() {
  return <footer className="footer" id="footer">
    <div><Link href="/" className="wordmark logo-link footer-logo-link" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} className="brand-logo"/></Link><p>Silver Beyond Occasions</p></div>
    <div><strong>EXPLORE</strong><Link href="/new-in">New In</Link><Link href="/jewellery">Jewellery</Link><Link href="/collections">Collections</Link><Link href="/collections/gifting-edit">Gifts</Link></div>
    <div><strong>HELP</strong><span className="footer-static-link">Shipping &amp; Returns</span><span className="footer-static-link">Care Guide</span><span className="footer-static-link">Contact Us</span></div>
    <div><strong>FOLLOW ALONG</strong><span className="footer-static-link"><Instagram size={16}/> Instagram</span><span className="footer-static-link">Privacy &amp; Terms</span></div>
    <div className="copyright">© 2026 Sri Alankar Jewellers. Demo storefront — checkout and inventory require a connected ecommerce service.</div>
  </footer>;
}
