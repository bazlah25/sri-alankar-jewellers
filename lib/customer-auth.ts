import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const CUSTOMER_COOKIE = "saj_customer_session";
const SESSION_DAYS = 30;

type CustomerDetails = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

function secret() {
  return process.env.CUSTOMER_SESSION_SECRET || process.env.SAJ_ADMIN_SESSION_SECRET || "";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hashCustomerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyCustomerPassword(password: string, stored: string) {
  const [algorithm, salt, expected] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString("hex");
  return safeEqual(actual, expected);
}

export function createCustomerSession(email: string) {
  if (!secret()) throw new Error("Customer sessions are not configured.");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${expiresAt}.${Buffer.from(email).toString("base64url")}.${randomBytes(12).toString("base64url")}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export function getCustomerEmailFromSession(token?: string) {
  if (!token || !secret()) return null;
  const [expiresAt, encodedEmail, nonce, signature, ...extra] = token.split(".");
  if (!expiresAt || !encodedEmail || !nonce || !signature || extra.length || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return null;
  const payload = `${expiresAt}.${encodedEmail}.${nonce}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
    return /^\S+@\S+\.\S+$/.test(email) ? email : null;
  } catch { return null; }
}

export function customerCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export function customerPublicDetails(details: CustomerDetails): CustomerDetails {
  return {
    email: details.email,
    firstName: details.firstName,
    lastName: details.lastName,
    phone: details.phone,
    ...(details.address ? { address: details.address } : {}),
    ...(details.addressLine2 ? { addressLine2: details.addressLine2 } : {}),
    ...(details.city ? { city: details.city } : {}),
    ...(details.state ? { state: details.state } : {}),
    ...(details.pincode ? { pincode: details.pincode } : {}),
  };
}
