import { NextResponse } from "next/server";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";
import { createInvoicePdf } from "@/lib/invoice-pdf";
import { getDatabaseCatalog } from "@/lib/product-catalog.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TrackingOrder = {
  id: string; created_at: string; status: string; payment_method: string;
  items: { product_id?: string; name: string; price: number; quantity: number; ring_size?: string }[]; subtotal: number; shipping: number; coupon_code?: string; discount?: number; total: number;
  customer?: { firstName: string; lastName: string; email: string; phone: string; address: string; addressLine2?: string; city: string; state: string; pincode: string };
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Order tracking is temporarily unavailable." }, { status: 503 });
  let body: { query?: unknown; invoiceId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter an order ID or mobile number." }, { status: 400 }); }
  if (typeof body.query !== "string") return NextResponse.json({ message: "Enter an order ID or mobile number." }, { status: 400 });
  const query = body.query.trim();
  const isOrderId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
  const orderReference = query.replace(/^#/, "").trim();
  const isShortReference = /^[0-9a-f]{8}$/i.test(orderReference);
  const phone = query.replace(/\D/g, "");
  if (!isOrderId && !isShortReference && (phone.length < 10 || phone.length > 15)) return NextResponse.json({ message: "Enter your order reference, full order ID, or the mobile number used at checkout." }, { status: 400 });
  try {
    if (body.invoiceId !== undefined) {
      if (typeof body.invoiceId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.invoiceId)) return NextResponse.json({ message: "Invalid order reference." }, { status: 400 });
      let invoiceFilter = `id=eq.${encodeURIComponent(body.invoiceId)}`;
      if (isOrderId && query.toLowerCase() !== body.invoiceId.toLowerCase()) return NextResponse.json({ message: "This order does not match the reference entered." }, { status: 404 });
      if (isShortReference && body.invoiceId.slice(0, 8).toLowerCase() !== orderReference.toLowerCase()) return NextResponse.json({ message: "This order does not match the reference entered." }, { status: 404 });
      if (!isOrderId && !isShortReference) invoiceFilter += phone.length === 10 ? `&phone_lookup=like.*${phone}` : `&phone_lookup=eq.${phone}`;
      const [order] = await supabaseRequest<TrackingOrder[]>(`orders?select=id,created_at,status,payment_method,customer,items,subtotal,shipping,coupon_code,discount,total&${invoiceFilter}&limit=1`);
      if (!order?.customer) return NextResponse.json({ message: "No matching order was found. Check the details and try again." }, { status: 404 });
      const catalog = await getDatabaseCatalog();
      const pdf = createInvoicePdf({ ...order, couponCode: order.coupon_code, customer: order.customer, items: (order.items || []).map(item => ({ ...item, image: catalog?.find(product => product.id === item.product_id)?.image })) });
      return new Response(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="Sri-Alankar-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf"`, "Cache-Control": "no-store" } });
    }
    const prefix = orderReference.toLowerCase();
    const lowerBound = `${prefix}-0000-0000-0000-000000000000`;
    const upperBound = `${prefix}-ffff-ffff-ffff-ffffffffffff`;
    const filter = isOrderId ? `id=eq.${encodeURIComponent(query)}` : isShortReference ? `id=gte.${lowerBound}&id=lte.${upperBound}` : phone.length === 10 ? `phone_lookup=like.*${phone}` : `phone_lookup=eq.${phone}`;
    const limit = isOrderId || isShortReference ? 1 : 10;
    const orders = await supabaseRequest<TrackingOrder[]>(`orders?select=id,created_at,status,payment_method,items,subtotal,shipping,coupon_code,discount,total&${filter}&order=created_at.desc&limit=${limit}`);
    if (!orders.length) return NextResponse.json({ orders: [], message: "No matching order was found. Check the details and try again." }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ lookupType: isOrderId || isShortReference ? "order" : "phone", orders: orders.map(order => ({
      id: order.id, created_at: order.created_at, status: order.status,
      payment_method: order.payment_method, subtotal: order.subtotal, shipping: order.shipping, coupon_code: order.coupon_code, discount: order.discount, total: order.total,
      items: Array.isArray(order.items) ? order.items.map(item => ({ product_id: item.product_id, name: item.name, price: item.price, quantity: item.quantity, ...(item.ring_size ? { ring_size: item.ring_size } : {}) })) : [],
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not look up this order. Please try again shortly." }, { status: 503 });
  }
}
