import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

export async function GET() {
  if (!isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value)) return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  try {
    const orders = await supabaseRequest<unknown[]>("orders?select=id,created_at,status,payment_method,customer,items,subtotal,shipping,total&order=created_at.desc&limit=100");
    return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not load orders from the database." }, { status: 503 });
  }
}
