"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/data/products";
import { useProductCatalog } from "@/components/ProductCatalogProvider";

export default function CartPage() {
  const { cart, setCartQuantity, removeFromCart } = useShop();
  const { products: catalogProducts } = useProductCatalog();
  const lines = cart.map(line => ({ ...line, product: catalogProducts.find(product => product.id === line.productId) })).filter(line => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.product!.price * line.quantity, 0);

  return <main className="sa-page sa-basket-page">
    <SiteHeader />
    <header className="sa-basket-heading"><span className="sa-eyebrow">YOUR SELECTION</span><h1>Shopping bag</h1><p>{lines.length} {lines.length === 1 ? "piece" : "pieces"} in your bag</p></header>
    {lines.length ? <div className="sa-basket-layout">
      <section className="sa-basket-items" aria-label="Items in your shopping bag">
        {lines.map(({ product, quantity, ringSize }) => product && <article className="sa-basket-item" key={`${product.id}-${ringSize || "standard"}`}>
          <Link className="sa-basket-image" href={`/products/${product.id}`}><Image src={product.image} alt={product.name} fill sizes="130px" unoptimized /></Link>
          <div className="sa-basket-item-copy"><span className="sa-eyebrow">{product.category}</span><h2><Link href={`/products/${product.id}`}>{product.name}</Link></h2><p>{product.material}{ringSize ? ` · Ring size ${ringSize}` : ""}</p><div className="sa-basket-quantity"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => setCartQuantity(product.id, quantity - 1, ringSize)}><Minus size={14}/></button><span>{quantity}</span><button aria-label={`Increase ${product.name} quantity`} onClick={() => setCartQuantity(product.id, quantity + 1, ringSize)}><Plus size={14}/></button></div></div>
          <div className="sa-basket-item-end"><strong>{formatPrice(product.price * quantity)}</strong><button className="sa-remove-item" onClick={() => removeFromCart(product.id, ringSize)}><Trash2 size={14}/> Remove</button></div>
        </article>)}
        <Link className="sa-continue-shopping" href="/jewellery">← Continue shopping</Link>
      </section>
      <aside className="sa-basket-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Shipping and taxes are calculated at checkout. Free shipping on orders above ₹2,999.</p><Link className="sa-button sa-button-dark" href="/checkout">PROCEED TO CHECKOUT</Link><span className="sa-basket-demo-note">Demo storefront · No payment will be collected</span></aside>
    </div> : <section className="sa-basket-empty"><p>Your bag is waiting for something special.</p><Link className="sa-button sa-button-dark" href="/jewellery">EXPLORE JEWELLERY</Link></section>}
    <SiteFooter />
  </main>;
}
