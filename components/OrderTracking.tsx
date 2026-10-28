"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, PackageCheck, Search } from "lucide-react";
import { formatPrice } from "@/data/products";

type TrackedOrder = {
  id: string; created_at: string; status: string; payment_method?: string; total?: number;
  items?: { name: string; quantity: number; ring_size?: string }[];
};

const stages = ["pending", "processing", "shipped", "delivered"];
const stageNames: Record<string, string> = { pending: "Order received", processing: "Preparing your order", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" };

export default function OrderTracking({ initialOrderId = "" }: { initialOrderId?: string }) {
  const [query, setQuery] = useState(initialOrderId);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const lookup = async (value: string) => {
    setLoading(true); setError(""); setOrders([]); setSearched(true);
    try {
      const response = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: value }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not look up this order.");
      setOrders(Array.isArray(result.orders) ? result.orders : []);
      if (result.message) setError(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not look up this order."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (initialOrderId) void lookup(initialOrderId); }, [initialOrderId]);

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (query.trim()) void lookup(query.trim()); };

  return <section className="sa-track-content">
    <form className="sa-track-form" onSubmit={submit}>
      <label htmlFor="track-query">Order ID or mobile number</label>
      <div><Search size={17}/><input id="track-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Paste order ID or enter mobile number" autoComplete="off" required/><button type="submit" disabled={loading}>{loading ? "SEARCHING…" : "TRACK ORDER"}<ArrowRight size={15}/></button></div>
      <small>Use the full order ID from your confirmation, or the mobile number entered at checkout.</small>
    </form>
    {error && <p className="sa-track-message" role="alert">{error}</p>}
    {searched && !loading && !error && !orders.length && <p className="sa-track-message">No matching order was found. Check the details and try again.</p>}
    {orders.length > 0 && <div className="sa-track-results" aria-live="polite">{orders.map(order => {
      const cancelled = order.status === "cancelled";
      const currentStage = Math.max(0, stages.indexOf(order.status));
      return <article className="sa-track-order" key={order.id}>
        <header><div><span className="sa-eyebrow">ORDER #{order.id.slice(0, 8).toUpperCase()}</span><h2>{stageNames[order.status] || "Order received"}</h2><p>Placed {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(order.created_at))}</p></div>{order.total !== undefined && <strong>{formatPrice(order.total)}</strong>}</header>
        {cancelled ? <p className="sa-track-cancelled">This order has been cancelled. Please contact us if you need help.</p> : <ol className="sa-track-progress">{stages.map((stage, index) => <li className={index <= currentStage ? "complete" : ""} key={stage}><span>{index <= currentStage ? <Check size={13}/> : index + 1}</span><small>{stageNames[stage]}</small></li>)}</ol>}
        {order.items?.length ? <div className="sa-track-items"><strong>Items</strong>{order.items.map((item, index) => <p key={`${item.name}-${index}`}>{item.name}{item.ring_size ? ` · Size ${item.ring_size}` : ""} <span>× {item.quantity}</span></p>)}</div> : <p className="sa-track-payment">For privacy, item details are shown when you track with your order ID.</p>}
        {order.payment_method && <p className="sa-track-payment"><PackageCheck size={15}/> {order.payment_method === "cod" ? "Cash on delivery" : order.payment_method}</p>}
      </article>;
    })}</div>}
  </section>;
}
