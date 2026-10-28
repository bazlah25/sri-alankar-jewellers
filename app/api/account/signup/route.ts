import { NextResponse } from "next/server";
import { createCustomerSession, customerCookieOptions, hashCustomerPassword } from "@/lib/customer-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Customer accounts are temporarily unavailable." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter your account details." }, { status: 400 }); }
  const details = {
    email: clean(body.email, 254).toLowerCase(), firstName: clean(body.firstName, 60), lastName: clean(body.lastName, 60),
    phone: clean(body.phone, 24), address: clean(body.address, 160), addressLine2: clean(body.addressLine2, 100),
    city: clean(body.city, 80), state: clean(body.state, 80), pincode: clean(body.pincode, 6),
  };
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(details.email) || !details.firstName || !details.lastName || !details.phone || password.length < 8 || password.length > 128) {
    return NextResponse.json({ message: "Enter a valid email, name, phone number, and password with at least 8 characters." }, { status: 400 });
  }
  try {
    const session = createCustomerSession(details.email);
    const [account] = await supabaseRequest<{ email: string }[]>("customer_accounts", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ email: details.email, password_hash: hashCustomerPassword(password), details }),
    });
    const response = NextResponse.json({ customer: details });
    response.cookies.set("saj_customer_session", session.token, customerCookieOptions(session.maxAge));
    return response;
  } catch {
    return NextResponse.json({ message: "An account with this email may already exist. Try signing in instead." }, { status: 409 });
  }
}
