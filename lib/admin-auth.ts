import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "saj_admin_session";
const SESSION_HOURS = 8;

export function isAdminConfigured() {
  return Boolean(process.env.SAJ_ADMIN_USERNAME && process.env.SAJ_ADMIN_PASSWORD && process.env.SAJ_ADMIN_SESSION_SECRET);
}

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.SAJ_ADMIN_USERNAME || "";
  const expectedPassword = process.env.SAJ_ADMIN_PASSWORD || "";
  return isAdminConfigured() && constantTimeEqual(username, expectedUsername) && constantTimeEqual(password, expectedPassword);
}

export function createAdminSession() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const nonce = randomBytes(18).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  const signature = createHmac("sha256", process.env.SAJ_ADMIN_SESSION_SECRET || "").update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, maxAge: SESSION_HOURS * 60 * 60 };
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !isAdminConfigured()) return false;
  const [expiresAt, nonce, signature, ...extra] = token.split(".");
  if (!expiresAt || !nonce || !signature || extra.length || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return false;
  const payload = `${expiresAt}.${nonce}`;
  const expected = createHmac("sha256", process.env.SAJ_ADMIN_SESSION_SECRET || "").update(payload).digest("base64url");
  return constantTimeEqual(signature, expected);
}
