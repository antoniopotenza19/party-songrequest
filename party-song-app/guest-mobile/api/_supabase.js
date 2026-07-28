export function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase is not configured");
  }

  return { url, serviceKey };
}

export async function supabaseRequest(path, options = {}) {
  const { url, serviceKey } = getSupabaseConfig();
  const authorizationHeaders = serviceKey.startsWith("sb_")
    ? {}
    : { Authorization: `Bearer ${serviceKey}` };
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      ...authorizationHeaders,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
