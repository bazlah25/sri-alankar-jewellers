import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminConfigured, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const valid = isAdminConfigured() && isValidAdminSession(token);
  return NextResponse.json({ authenticated: valid }, { status: valid ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
