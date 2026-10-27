const projectUrl = () => process.env.SUPABASE_URL?.replace(/\/$/, "");
const secretKey = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isDatabaseConfigured() {
  return Boolean(projectUrl() && secretKey());
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = projectUrl();
  const key = secretKey();
  if (!url || !key) throw new Error("Database is not configured on this server.");
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Content-Type", "application/json");
  if (process.env.SUPABASE_SECRET_KEY) headers.delete("Authorization");
  else headers.set("Authorization", `Bearer ${key}`);
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Database request failed (${response.status}): ${detail.slice(0, 400)}`);
  }
  // PostgREST can return 201 with an empty body for `return=minimal`, just as
  // it returns 204 for an empty response. Read the body once and only parse
  // JSON when the response actually contains it.
  const body = await response.text();
  if (!body) return undefined as T;
  return JSON.parse(body) as T;
}
