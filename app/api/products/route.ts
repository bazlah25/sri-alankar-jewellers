import { NextResponse } from "next/server";
import { getDatabaseCatalog } from "@/lib/product-catalog.server";
import { isDatabaseConfigured } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getDatabaseCatalog();
    return NextResponse.json({ configured: isDatabaseConfigured(), products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not load the product catalogue." }, { status: 503 });
  }
}
