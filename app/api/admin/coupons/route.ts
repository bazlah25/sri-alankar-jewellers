import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";
import type { Coupon } from "@/lib/coupons";

export const runtime = "nodejs";
const authorized = () => isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value);

function validCoupon(body: Partial<Coupon>) {
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const value = Number(body.discount_value);
  const start = typeof body.valid_from === "string" ? Date.parse(body.valid_from) : NaN;
  const end = typeof body.valid_to === "string" ? Date.parse(body.valid_to) : NaN;
  return /^[A-Z0-9_-]{3,32}$/.test(code) && (body.discount_type === "percentage" || body.discount_type === "fixed") && Number.isInteger(value) && value > 0 && (body.discount_type !== "percentage" || value <= 100) && Number.isFinite(start) && Number.isFinite(end) && end > start && typeof body.active === "boolean";
}

export async function GET() {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured." }, { status: 503 });
  try {
    const coupons = await supabaseRequest<Coupon[]>("coupons?select=id,code,discount_type,discount_value,valid_from,valid_to,active&order=created_at.desc");
    return NextResponse.json({ coupons }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Could not load coupons. Apply the latest Supabase migration first." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured." }, { status: 503 });
  let body: Partial<Coupon>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid coupon details." }, { status: 400 }); }
  if (!validCoupon(body)) return NextResponse.json({ message: "Enter a unique code, valid discount, and end date after the start date." }, { status: 400 });
  try {
    await supabaseRequest("coupons", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ code: body.code!.trim().toUpperCase(), discount_type: body.discount_type, discount_value: Number(body.discount_value), valid_from: body.valid_from, valid_to: body.valid_to, active: body.active }) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("23505") ? "That coupon code already exists." : "Could not save the coupon.";
    return NextResponse.json({ message }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured." }, { status: 503 });
  let body: Partial<Coupon>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid coupon details." }, { status: 400 }); }
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !validCoupon(body)) return NextResponse.json({ message: "Enter valid coupon details." }, { status: 400 });
  try {
    await supabaseRequest(`coupons?id=eq.${encodeURIComponent(body.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ code: body.code!.trim().toUpperCase(), discount_type: body.discount_type, discount_value: Number(body.discount_value), valid_from: body.valid_from, valid_to: body.valid_to, active: body.active }) });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ message: "Could not update the coupon." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  if (!authorized()) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ message: "Invalid coupon." }, { status: 400 });
  try { await supabaseRequest(`coupons?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ message: "Could not remove the coupon." }, { status: 503 }); }
}
