import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
const statuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

export async function PATCH(request: Request) {
  if (!isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value)) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured on this server." }, { status: 503 });
  let body: { orderId?: unknown; status?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid order status update." }, { status: 400 }); }
  if (typeof body.orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.orderId) || typeof body.status !== "string" || !statuses.has(body.status)) {
    return NextResponse.json({ message: "Choose a valid order status." }, { status: 400 });
  }
  try {
    await supabaseRequest(`orders?id=eq.${encodeURIComponent(body.orderId)}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: body.status }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Could not update this order status." }, { status: 503 });
  }
}
