import { NextResponse } from "next/server";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TrackingOrder = {
  id: string; created_at: string; status: string; payment_method: string;
  items: { name: string; quantity: number; ring_size?: string }[]; total: number;
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Order tracking is temporarily unavailable." }, { status: 503 });
  let body: { query?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter an order ID or mobile number." }, { status: 400 }); }
  if (typeof body.query !== "string") return NextResponse.json({ message: "Enter an order ID or mobile number." }, { status: 400 });
  const query = body.query.trim();
  const isOrderId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
  const phone = query.replace(/\D/g, "");
  if (!isOrderId && (phone.length < 10 || phone.length > 15)) return NextResponse.json({ message: "Enter your full order ID or the mobile number used at checkout." }, { status: 400 });
  try {
    const filter = isOrderId ? `id=eq.${encodeURIComponent(query)}` : phone.length === 10 ? `phone_lookup=like.*${phone}` : `phone_lookup=eq.${phone}`;
    const orders = await supabaseRequest<TrackingOrder[]>(`orders?select=id,created_at,status,payment_method,items,total&${filter}&order=created_at.desc&limit=10`);
    if (!orders.length) return NextResponse.json({ orders: [], message: "No matching order was found. Check the details and try again." }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ lookupType: isOrderId ? "order" : "phone", orders: orders.map(order => isOrderId ? ({
      id: order.id, created_at: order.created_at, status: order.status,
      payment_method: order.payment_method, total: order.total,
      items: Array.isArray(order.items) ? order.items.map(item => ({ name: item.name, quantity: item.quantity, ...(item.ring_size ? { ring_size: item.ring_size } : {}) })) : [],
    }) : ({ id: order.id.slice(0, 8), created_at: order.created_at, status: order.status })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not look up this order. Please try again shortly." }, { status: 503 });
  }
}
