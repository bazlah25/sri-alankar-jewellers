import { NextResponse } from "next/server";
import { getDatabaseCatalog } from "@/lib/product-catalog.server";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

type OrderInput = {
  email?: unknown; phone?: unknown; firstName?: unknown; lastName?: unknown;
  address?: unknown; addressLine2?: unknown; city?: unknown; state?: unknown; pincode?: unknown;
  paymentMethod?: unknown; items?: unknown;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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
  const requested = new Map<string, number>();
  for (const raw of body.items) {
    if (!raw || typeof raw !== "object") return NextResponse.json({ message: "Invalid order items." }, { status: 400 });
    const item = raw as { productId?: unknown; quantity?: unknown };
    if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > 20) return NextResponse.json({ message: "Invalid order quantities." }, { status: 400 });
    requested.set(item.productId, (requested.get(item.productId) || 0) + Number(item.quantity));
  }
  try {
    const products = await getDatabaseCatalog();
    if (!products) throw new Error("Database not configured");
    const items = [...requested.entries()].map(([productId, quantity]) => {
      const product = products.find(candidate => candidate.id === productId);
      if (!product || !product.available) throw new Error("A selected product is unavailable.");
      return { product_id: product.id, name: product.name, price: product.price, quantity };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 2999 ? 0 : 99;
    const [order] = await supabaseRequest<{ id: string }[]>("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ customer, items, subtotal, shipping, total: subtotal + shipping, payment_method: "cod", status: "pending" }),
    });
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return NextResponse.json({ message: message.includes("unavailable") ? message : "Could not save your order. Please try again." }, { status: 503 });
  }
}
