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
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
