import { supabaseRequest } from "../_supabase.js";

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

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeTable(value) {
  const table = cleanText(value, 60);
  if (!table) return "";
  return /^tavol/i.test(table) ? table : `Tavolo ${table}`;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = readBody(request);
  const track = body.track && typeof body.track === "object" ? body.track : {};
  const dedication =
    body.dedication && typeof body.dedication === "object"
      ? body.dedication
      : null;

  const spotifyTrackId = cleanText(track.id, 120);
  const title = cleanText(track.title, 180);
  const artist = cleanText(track.artist, 180);
  const recipient = cleanText(dedication?.recipient, 100);

  if (!spotifyTrackId || !title || !artist) {
    return response.status(400).json({
      error: "Seleziona una canzone valida prima di inviare.",
    });
  }

  if (dedication && !recipient) {
    return response.status(400).json({
      error: "Inserisci il nome della persona a cui è dedicata.",
    });
  }

  const record = {
    status: "queued",
    spotify_track_id: spotifyTrackId,
    title,
    artist,
    cover_url: cleanText(track.cover, 1000) || null,
    spotify_url: cleanText(track.spotifyUrl, 1000) || null,
    table_label: normalizeTable(body.table) || null,
    dedication_recipient: recipient || null,
    dedication_sender: cleanText(dedication?.sender, 100) || null,
    dedication_message: cleanText(dedication?.message, 240) || null,
  };

  try {
    const rows = await supabaseRequest("song_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(record),
    });

    return response.status(201).json({ request: rows?.[0] ?? record });
  } catch (error) {
    console.error("Song request insert error:", error);
    return response.status(503).json({
      error: "Le richieste non sono disponibili. Riprova tra qualche secondo.",
    });
  }
}
