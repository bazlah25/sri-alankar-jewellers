"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useShop } from "@/components/ShopProvider";
import { formatPrice, products } from "@/data/products";

export default function CheckoutPage() {
  const { cart } = useShop();
  const [submitted, setSubmitted] = useState(false);
  const lines = cart.map(line => ({ ...line, product: products.find(product => product.id === line.productId) })).filter(line => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.product!.price * line.quantity, 0);
  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <main className="sa-page sa-checkout-page">
    <SiteHeader />
    <header className="sa-basket-heading"><span className="sa-eyebrow">A FEW DETAILS</span><h1>Checkout</h1><p>Complete your delivery details and review your order.</p></header>
    {submitted ? <section className="sa-checkout-success" role="status"><span className="sa-eyebrow">DEMO CHECKOUT</span><h2>Thank you</h2><p>This checkout is a preview. No order was placed and no payment or customer details were saved.</p><Link className="sa-button sa-button-dark" href="/jewellery">CONTINUE SHOPPING</Link></section> : lines.length ? <div className="sa-checkout-layout">
      <form id="checkout-form" className="sa-checkout-form" onSubmit={handleSubmit}>
        <section className="sa-checkout-section"><div className="sa-checkout-section-heading"><span>01</span><div><h2>Contact information</h2><p>We’ll use these details for order updates.</p></div></div>
          <div className="sa-checkout-fields"><label className="sa-field-wide">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label><label>First name<input name="firstName" autoComplete="given-name" maxLength={60} required /></label><label>Last name<input name="lastName" autoComplete="family-name" maxLength={60} required /></label><label className="sa-field-wide">Phone number<input type="tel" name="phone" autoComplete="tel" inputMode="tel" pattern="[0-9+() -]{10,18}" placeholder="10-digit mobile number" required /></label></div>
        </section>
        <section className="sa-checkout-section"><div className="sa-checkout-section-heading"><span>02</span><div><h2>Delivery address</h2><p>Where should we send your Sri Alankar Jewellers pieces?</p></div></div>
          <div className="sa-checkout-fields"><label className="sa-field-wide">Address<input name="address" autoComplete="street-address" maxLength={160} required /></label><label>Apartment, suite, etc. <small>Optional</small><input name="addressLine2" autoComplete="address-line2" maxLength={100} /></label><label>City<input name="city" autoComplete="address-level2" maxLength={80} required /></label><label>State<input name="state" autoComplete="address-level1" maxLength={80} required /></label><label>PIN code<input name="pincode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6 digits" required /></label></div>
        </section>
        <section className="sa-checkout-section"><div className="sa-checkout-section-heading"><span>03</span><div><h2>Payment method</h2><p>Choose a demo option to complete the preview.</p></div></div>
          <label className="sa-payment-option"><input type="radio" name="payment" value="cod" defaultChecked /><span><strong>Cash on delivery</strong><small>Shown for preview only; no order will be placed.</small></span></label>
          <label className="sa-payment-option sa-payment-disabled"><input type="radio" name="payment" value="online" disabled /><span><strong>Pay online</strong><small>Online payment will be available when payments are connected.</small></span></label>
        </section>
        <button className="sa-checkout-submit" type="submit"><LockKeyhole size={15}/> PLACE DEMO ORDER</button>
        <p className="sa-checkout-privacy-note">Demo only. Form details are not stored or sent anywhere.</p>
      </form>
      <aside className="sa-checkout-summary"><h2>Your order</h2>{lines.map(({ product, quantity }) => product && <article className="sa-checkout-line" key={product.id}><Link className="sa-checkout-product-image" href={`/products/${product.id}`}><Image src={product.image} alt={product.name} fill sizes="76px" unoptimized/><span>{quantity}</span></Link><div><h3>{product.name}</h3><p>{product.material}</p></div><strong>{formatPrice(product.price * quantity)}</strong></article>)}
        <div className="sa-checkout-totals"><p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><p><span>Shipping</span><strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong></p><p className="sa-checkout-grand-total"><span>Total</span><strong>{formatPrice(total)}</strong></p></div>
        <p className="sa-checkout-shipping-note">{subtotal >= 2999 ? "Your order qualifies for free shipping." : `Add ${formatPrice(2999 - subtotal)} more for free shipping.`}</p>
      </aside>
      <Link className="sa-checkout-back" href="/cart"><ArrowLeft size={14}/> Back to shopping bag</Link>
    </div> : <section className="sa-basket-empty"><p>Your bag is empty. Add something special before checkout.</p><Link className="sa-button sa-button-dark" href="/jewellery">EXPLORE JEWELLERY</Link></section>}
    <SiteFooter />
  </main>;
}
