import { supabaseRequest } from "../_supabase.js";

const allowedStatuses = new Set(["queued", "played"]);

function readBody(request) {
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body && typeof request.body === "object" ? request.body : {};
}

function cleanId(value) {
  return String(value ?? "").trim().slice(0, 120);
}

async function listRequests(response) {
  const rows = await supabaseRequest(
    "song_requests?select=*&order=created_at.asc",
  );
  return response.status(200).json({ requests: Array.isArray(rows) ? rows : [] });
}

async function updateRequest(request, response) {
  const body = readBody(request);
  const id = cleanId(body.id);
  const status = String(body.status ?? "");

  if (!id || !allowedStatuses.has(status)) {
    return response.status(400).json({ error: "Richiesta non valida." });
  }

  const update = {
    status,
    updated_at: new Date().toISOString(),
    played_at: status === "played" ? new Date().toISOString() : null,
  };
  const rows = await supabaseRequest(
    `song_requests?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(update),
    },
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return response.status(404).json({ error: "Richiesta non trovata." });
  }

  return response.status(200).json({ request: rows[0] });
}

async function deleteRequest(request, response) {
  const rawId = Array.isArray(request.query?.id)
    ? request.query.id[0]
    : request.query?.id;
  const id = cleanId(rawId);

  if (!id) {
    return response.status(400).json({ error: "ID richiesta mancante." });
  }

  await supabaseRequest(`song_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return response.status(200).json({ ok: true });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  try {
    if (request.method === "GET") return await listRequests(response);
    if (request.method === "PATCH") {
      return await updateRequest(request, response);
    }
    if (request.method === "DELETE") {
      return await deleteRequest(request, response);
    }

    response.setHeader("Allow", "GET, PATCH, DELETE");
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("DJ requests API error:", error);
    return response.status(503).json({
      error: "Il collegamento alle richieste non è disponibile.",
    });
  }
}
