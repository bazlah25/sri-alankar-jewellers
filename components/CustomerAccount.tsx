"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { formatPrice } from "@/data/products";

type Customer = { email: string; firstName: string; lastName: string; phone: string; address?: string; addressLine2?: string; city?: string; state?: string; pincode?: string };
type AccountOrder = { id: string; created_at: string; status: string; items: { name: string; quantity: number; ring_size?: string }[]; total: number };

export default function CustomerAccount() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (response.status === 401) { router.replace("/account/login"); return; }
      if (!response.ok) throw new Error(result.message || "Could not load your account.");
      setCustomer(result.customer); setOrders(Array.isArray(result.orders) ? result.orders : []);
    }).catch(reason => setError(reason instanceof Error ? reason.message : "Could not load your account.")).finally(() => setLoading(false));
  }, [router]);

  const logout = async () => { await fetch("/api/account/logout", { method: "POST" }).catch(() => undefined); router.replace("/account/login"); router.refresh(); };

  if (loading) return <div className="sa-account-loading">Loading your account…</div>;
  if (error) return <div className="sa-account-loading" role="alert">{error}</div>;
  if (!customer) return null;

  const address = [customer.address, customer.addressLine2, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ");
  return <section className="sa-account-content">
    <div className="sa-account-welcome"><div><span className="sa-eyebrow">YOUR SRI ALANKAR ACCOUNT</span><h2>Hello, {customer.firstName}</h2><p>Your details and order history, together.</p></div><button type="button" onClick={() => void logout()}><LogOut size={15}/> SIGN OUT</button></div>
    <div className="sa-account-grid"><article className="sa-account-panel"><span className="sa-eyebrow">PERSONAL DETAILS</span><h3>{customer.firstName} {customer.lastName}</h3><p>{customer.email}<br/>{customer.phone}</p>{address && <p>{address}</p>}</article><article className="sa-account-panel sa-account-shortcut"><span className="sa-eyebrow">ORDER UPDATES</span><h3>Already have an order?</h3><p>Check its latest status with your order reference or mobile number.</p><Link href="/track">TRACK AN ORDER <ArrowRight size={15}/></Link></article></div>
    <section className="sa-account-orders"><header><div><span className="sa-eyebrow">YOUR PURCHASES</span><h2>Order history</h2></div><span>{orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}</span></header>
      {orders.length ? <div className="sa-account-order-list">{orders.map(order => <article className="sa-account-order" key={order.id}><div className="sa-account-order-id"><strong>#{order.id.slice(0,8).toUpperCase()}</strong><span>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(order.created_at))}</span></div><div className="sa-account-order-items">{order.items.map((item,index)=><p key={`${item.name}-${index}`}>{item.name}{item.ring_size ? ` · Size ${item.ring_size}` : ""} · Qty {item.quantity}</p>)}</div><span className={`sa-account-order-status ${order.status}`}>{order.status}</span><strong className="sa-account-order-total">{formatPrice(order.total)}</strong><Link href={`/track?order=${encodeURIComponent(order.id)}`} aria-label={`Track order ${order.id.slice(0,8)}`}><ArrowRight size={17}/></Link></article>)}</div> : <div className="sa-account-empty"><Image src="/sri-alankar-logo.png" alt="" width={100} height={40}/><p>No orders are linked to this account yet.</p><Link href="/jewellery">EXPLORE JEWELLERY <ArrowRight size={15}/></Link></div>}
    </section>
  </section>;
}
