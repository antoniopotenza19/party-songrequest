import assert from "node:assert/strict";
import test from "node:test";

import handler from "../api/spotify/search.js";

function createResponse() {
  return {
    body: undefined,
    headers: new Map(),
    statusCode: 200,
    setHeader(name, value) {
      this.headers.set(name.toLowerCase(), value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("maps Spotify search results without exposing credentials", async () => {
  const originalFetch = globalThis.fetch;
  const originalClientId = process.env.SPOTIFY_CLIENT_ID;
  const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  process.env.SPOTIFY_CLIENT_ID = "test-client";
  process.env.SPOTIFY_CLIENT_SECRET = "test-secret";

  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });

    if (String(url).includes("/api/token")) {
      return new Response(
        JSON.stringify({ access_token: "test-token", expires_in: 3600 }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        tracks: {
          items: [
            {
              id: "spotify-track-id",
              name: "Vivere",
              duration_ms: 366000,
              artists: [{ name: "Vasco Rossi" }],
              album: {
                images: [
                  {
                    url: "https://i.scdn.co/image/test-cover",
                    width: 300,
                    height: 300,
                  },
                ],
              },
              external_urls: {
                spotify: "https://open.spotify.com/track/spotify-track-id",
              },
            },
          ],
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const response = createResponse();
    await handler({ method: "GET", query: { q: "Vasco" } }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      tracks: [
        {
          id: "spotify-track-id",
          title: "Vivere",
          artist: "Vasco Rossi",
          cover: "https://i.scdn.co/image/test-cover",
          spotifyUrl: "https://open.spotify.com/track/spotify-track-id",
          durationMs: 366000,
        },
      ],
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0].options.headers.Authorization, /^Basic /);
    assert.equal(calls[1].options.headers.Authorization, "Bearer test-token");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalClientId === undefined) delete process.env.SPOTIFY_CLIENT_ID;
    else process.env.SPOTIFY_CLIENT_ID = originalClientId;
    if (originalClientSecret === undefined) {
      delete process.env.SPOTIFY_CLIENT_SECRET;
    } else {
      process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret;
    }
  }
});

test("rejects requests with a query shorter than two characters", async () => {
  const response = createResponse();
  await handler({ method: "GET", query: { q: "V" } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /almeno 2 caratteri/i);
});

test("accepts only GET requests", async () => {
  const response = createResponse();
  await handler({ method: "POST", query: {} }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.get("allow"), "GET");
});
