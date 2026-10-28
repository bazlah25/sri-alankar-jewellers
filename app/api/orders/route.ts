import { NextResponse } from "next/server";
import { getDatabaseCatalog } from "@/lib/product-catalog.server";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { couponDiscount, type Coupon } from "@/lib/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderInput = {
  email?: unknown; phone?: unknown; firstName?: unknown; lastName?: unknown;
  address?: unknown; addressLine2?: unknown; city?: unknown; state?: unknown; pincode?: unknown;
  paymentMethod?: unknown; items?: unknown; couponCode?: unknown;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Coupons are temporarily unavailable." }, { status: 503 });
  const url = new URL(request.url);
  const code = text(url.searchParams.get("coupon"), 32).toUpperCase();
  const subtotal = Number(url.searchParams.get("subtotal"));
  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !Number.isSafeInteger(subtotal) || subtotal < 1) return NextResponse.json({ message: "Enter a valid coupon code." }, { status: 400 });
  try {
    const rows = await supabaseRequest<Coupon[]>(`coupons?select=id,code,discount_type,discount_value,valid_from,valid_to,active&code=eq.${encodeURIComponent(code)}&limit=1`);
    const coupon = rows[0];
    if (!coupon) return NextResponse.json({ message: "That coupon code isn’t valid." }, { status: 404 });
    const discount = couponDiscount(coupon, subtotal);
    if (discount === null) return NextResponse.json({ message: "That coupon is inactive or outside its validity dates." }, { status: 400 });
    return NextResponse.json({ code: coupon.code, discount }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Could not check this coupon. Please try again." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Orders cannot be saved until the store database is connected." }, { status: 503 });
  let body: OrderInput;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid order details." }, { status: 400 }); }
  const customer = {
    email: text(body.email, 254).toLowerCase(), phone: text(body.phone, 24),
    firstName: text(body.firstName, 60), lastName: text(body.lastName, 60),
    address: text(body.address, 160), addressLine2: text(body.addressLine2, 100),
    city: text(body.city, 80), state: text(body.state, 80), pincode: text(body.pincode, 6),
  };
  if (!/^\S+@\S+\.\S+$/.test(customer.email) || !customer.phone || !customer.firstName || !customer.lastName || !customer.address || !customer.city || !customer.state || !/^\d{6}$/.test(customer.pincode)) {
    return NextResponse.json({ message: "Please check the contact and delivery details." }, { status: 400 });
  }
  if (body.paymentMethod !== "cod" || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    return NextResponse.json({ message: "This checkout currently accepts Cash on Delivery orders only." }, { status: 400 });
  }
  const requested = new Map<string, { productId: string; ringSize?: string; quantity: number }>();
  for (const raw of body.items) {
    if (!raw || typeof raw !== "object") return NextResponse.json({ message: "Invalid order items." }, { status: 400 });
    const item = raw as { productId?: unknown; quantity?: unknown; ringSize?: unknown };
    if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 20) return NextResponse.json({ message: "Invalid order quantities." }, { status: 400 });
    if (item.ringSize !== undefined && (typeof item.ringSize !== "string" || item.ringSize.length > 40)) return NextResponse.json({ message: "Invalid ring size." }, { status: 400 });
    const ringSize = typeof item.ringSize === "string" ? item.ringSize : undefined;
    const key = `${item.productId}::${ringSize || ""}`;
    const current = requested.get(key);
    requested.set(key, { productId: item.productId, ringSize, quantity: (current?.quantity || 0) + Number(item.quantity) });
  }
  try {
    const products = await getDatabaseCatalog();
    if (!products) throw new Error("Database not configured");
    const items = [...requested.values()].map(({ productId, ringSize, quantity }) => {
      const product = products.find(candidate => candidate.id === productId);
      if (!product || !product.available) throw new Error("A selected product is unavailable.");
      if (product.category === "Rings" && product.ringSizes?.length && (!ringSize || !product.ringSizes.includes(ringSize))) throw new Error("Choose a valid ring size for each ring.");
      return { product_id: product.id, name: product.name, price: product.price, quantity, ...(ringSize ? { ring_size: ringSize } : {}) };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let couponCode: string | null = null;
    let discount = 0;
    if (body.couponCode !== undefined && body.couponCode !== null && body.couponCode !== "") {
      couponCode = text(body.couponCode, 32).toUpperCase();
      if (!/^[A-Z0-9_-]{3,32}$/.test(couponCode)) return NextResponse.json({ message: "Enter a valid coupon code." }, { status: 400 });
      const coupons = await supabaseRequest<Coupon[]>(`coupons?select=id,code,discount_type,discount_value,valid_from,valid_to,active&code=eq.${encodeURIComponent(couponCode)}&limit=1`);
      const coupon = coupons[0];
      if (!coupon) return NextResponse.json({ message: "That coupon code isn’t valid." }, { status: 400 });
      const calculatedDiscount = couponDiscount(coupon, subtotal);
      if (calculatedDiscount === null) return NextResponse.json({ message: "That coupon is inactive or outside its validity dates." }, { status: 400 });
      discount = calculatedDiscount;
      couponCode = coupon.code;
    }
    const shipping = subtotal >= 2999 ? 0 : 99;
    const total = Math.max(0, subtotal - discount) + shipping;
    const [order] = await supabaseRequest<{ id: string; created_at: string; status: string }[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ customer, phone_lookup: customer.phone.replace(/\D/g, ""), items, subtotal, shipping, coupon_code: couponCode, discount, total, payment_method: "cod", status: "pending" }),
    });
    const emailSent = await sendOrderConfirmationEmail({
      id: order.id, created_at: order.created_at, status: order.status, customer,
      items: items.map(item => ({ ...item, image: products.find(product => product.id === item.product_id)?.image, ...(item.ring_size ? { ring_size: item.ring_size } : {}) })),
      subtotal, shipping, discount, couponCode: couponCode || undefined, total,
    });
    return NextResponse.json({ orderId: order.id, emailSent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return NextResponse.json({ message: message.includes("unavailable") || message.includes("ring size") ? message : "Could not save your order. Please try again." }, { status: 503 });
  }
}
