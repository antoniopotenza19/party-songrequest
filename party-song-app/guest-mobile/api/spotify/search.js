const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";

let tokenCache = {
  accessToken: "",
  expiresAt: 0,
};

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials are not configured");
  }

  if (
    tokenCache.accessToken &&
    Date.now() < tokenCache.expiresAt - 60_000
  ) {
    return tokenCache.accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  const payload = await response.json();
  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in ?? 3600) * 1000,
  };

  return tokenCache.accessToken;
}

function mapTrack(track) {
  const artists = Array.isArray(track.artists)
    ? track.artists.map((artist) => artist.name).filter(Boolean).join(", ")
    : "";
  const images = Array.isArray(track.album?.images) ? track.album.images : [];
  const preferredCover =
    images.find((image) => image.width === 300)?.url ??
    images.find((image) => image.width >= 300)?.url ??
    images[0]?.url ??
    "";

  return {
    id: track.id,
    title: track.name,
    artist: artists,
    cover: preferredCover,
    spotifyUrl: track.external_urls?.spotify ?? "",
    durationMs: track.duration_ms,
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const rawQuery = Array.isArray(request.query?.q)
    ? request.query.q[0]
    : request.query?.q;
  const query = String(rawQuery ?? "").trim().slice(0, 100);

  if (query.length < 2) {
    return response.status(400).json({
      error: "La ricerca deve contenere almeno 2 caratteri.",
    });
  }

  try {
    const accessToken = await getAccessToken();
    const url = new URL(SEARCH_ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("type", "track");
    url.searchParams.set("market", "IT");
    url.searchParams.set("limit", "10");

    const spotifyResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (spotifyResponse.status === 429) {
      const retryAfter = spotifyResponse.headers.get("retry-after");
      if (retryAfter) response.setHeader("Retry-After", retryAfter);
      return response.status(429).json({
        error: "Troppe ricerche. Riprova tra qualche secondo.",
      });
    }

    if (!spotifyResponse.ok) {
      throw new Error(
        `Spotify search request failed with ${spotifyResponse.status}`,
      );
    }

    const payload = await spotifyResponse.json();
    const items = Array.isArray(payload.tracks?.items)
      ? payload.tracks.items
      : [];

    return response.status(200).json({
      tracks: items.filter(Boolean).map(mapTrack),
    });
  } catch (error) {
    console.error("Spotify search error:", error);
    return response.status(503).json({
      error: "La ricerca Spotify non è disponibile in questo momento.",
    });
  }
}
