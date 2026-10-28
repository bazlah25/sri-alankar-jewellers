import { NextResponse } from "next/server";
import { createCustomerSession, customerCookieOptions, customerPublicDetails, verifyCustomerPassword } from "@/lib/customer-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

type AccountRow = { email: string; password_hash: string; details: { email: string; firstName: string; lastName: string; phone: string; address?: string; addressLine2?: string; city?: string; state?: string; pincode?: string } };

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Customer accounts are temporarily unavailable." }, { status: 503 });
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter your email and password." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || !password) return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  try {
    const accounts = await supabaseRequest<AccountRow[]>(`customer_accounts?select=email,password_hash,details&email=eq.${encodeURIComponent(email)}&limit=1`);
    const account = accounts[0];
    if (!account || !verifyCustomerPassword(password, account.password_hash)) return NextResponse.json({ message: "Email or password is incorrect." }, { status: 401 });
    const session = createCustomerSession(account.email);
    const response = NextResponse.json({ customer: customerPublicDetails(account.details) });
    response.cookies.set("saj_customer_session", session.token, customerCookieOptions(session.maxAge));
    return response;
  } catch {
    return NextResponse.json({ message: "Could not sign in right now. Please try again." }, { status: 503 });
  }
}
