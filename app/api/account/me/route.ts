import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, getCustomerEmailFromSession } from "@/lib/customer-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AccountRow = { email: string; details: Record<string, string> };
type OrderRow = { id: string; created_at: string; status: string; items: { name: string; quantity: number; ring_size?: string }[]; total: number };

export async function GET() {
  const email = getCustomerEmailFromSession(cookies().get(CUSTOMER_COOKIE)?.value);
  if (!email) return NextResponse.json({ message: "Sign in to view your account." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Customer accounts are temporarily unavailable." }, { status: 503 });
  try {
    const [account] = await supabaseRequest<AccountRow[]>(`customer_accounts?select=email,details&email=eq.${encodeURIComponent(email)}&limit=1`);
    if (!account) return NextResponse.json({ message: "This account could not be found." }, { status: 404 });
    const orders = await supabaseRequest<OrderRow[]>(`orders?select=id,created_at,status,items,total&customer->>email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=50`);
    return NextResponse.json({ customer: account.details, orders }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not load your account right now." }, { status: 503 });
  }
}
