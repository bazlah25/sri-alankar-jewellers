import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminSession, isAdminConfigured, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminConfigured()) return NextResponse.json({ message: "Admin sign-in is not configured on this server." }, { status: 503 });
  let body: { username?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Enter your username and password." }, { status: 400 }); }
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminCredentials(username, password)) return NextResponse.json({ message: "Username or password is incorrect." }, { status: 401 });

  const session = createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
