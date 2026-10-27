import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTING_ID = "default";
const imageKeys = new Set([
  "home", "all-jewellery", "new-in",
  "category:necklaces", "category:earrings", "category:rings",
  "category:bracelets", "category:photo-frames", "category:pooja-essentials",
]);
type HeroAsset = { desktop?: string; mobile?: string };
type SettingsMap = Record<string, HeroAsset | string>;
type SettingsRow = { settings: SettingsMap };

async function readSettings() {
  const rows = await supabaseRequest<SettingsRow[]>(`storefront_settings?select=settings&id=eq.${SETTING_ID}&limit=1`);
  return rows[0]?.settings || {};
}

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ configured: false, images: {} });
  try {
    return NextResponse.json({ configured: true, images: await readSettings() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Could not load storefront images. Apply the storefront image settings migration in Supabase." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ message: "Admin sign in required." }, { status: 401 });
  }
  if (!isDatabaseConfigured()) return NextResponse.json({ message: "Database isn't configured on this server." }, { status: 503 });
  let body: { key?: unknown; viewport?: unknown; image?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid image settings." }, { status: 400 }); }
  if (typeof body.key !== "string" || !imageKeys.has(body.key) ||
      (body.viewport !== "desktop" && body.viewport !== "mobile") || typeof body.image !== "string") {
    return NextResponse.json({ message: "Choose a supported storefront image." }, { status: 400 });
  }
  if (body.image && (!body.image.startsWith("data:image/jpeg;base64,") || body.image.length > 4_000_000)) {
    return NextResponse.json({ message: "Image must be a compressed JPEG smaller than 3 MB." }, { status: 413 });
  }
  try {
    const settings = await readSettings();
    const previous = settings[body.key];
    const asset: HeroAsset = typeof previous === "string" ? { desktop: previous } : { ...(previous || {}) };
    if (body.image) asset[body.viewport] = body.image;
    else delete asset[body.viewport];
    if (asset.desktop || asset.mobile) settings[body.key] = asset;
    else delete settings[body.key];
    await supabaseRequest("storefront_settings?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: SETTING_ID, settings, updated_at: new Date().toISOString() }),
    });
    return NextResponse.json({ ok: true, images: settings });
  } catch {
    return NextResponse.json({ message: "Could not save storefront images. Confirm the new Supabase migration has been applied." }, { status: 503 });
  }
}
