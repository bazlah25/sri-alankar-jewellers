import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

function authorized() {
  return isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value);
}

function validProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return typeof product.id === "string" && typeof product.name === "string" &&
    Number.isFinite(product.price) && product.price! > 0 && typeof product.image === "string" &&
    typeof product.category === "string" && typeof product.available === "boolean";
}

export async function POST(request: Request) {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  let product: unknown;
  try { product = await request.json(); } catch { return NextResponse.json({ message: "Invalid product data." }, { status: 400 }); }
  if (!validProduct(product)) return NextResponse.json({ message: "Product details are incomplete." }, { status: 400 });
  try {
    await supabaseRequest("products?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: product.id, product, updated_at: new Date().toISOString() }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Could not save this product to the database." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  try {
    await supabaseRequest(`products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Could not remove this product from the database." }, { status: 503 });
  }
}
