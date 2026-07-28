import assert from "node:assert/strict";
import test from "node:test";

import handler from "../api/requests/index.js";

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

test("creates a queued request with dedication message and table", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://party.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";

  let insertedRecord;
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), "https://party.supabase.co/rest/v1/song_requests");
    assert.equal(options.headers.apikey, "service-role-test");
    insertedRecord = JSON.parse(options.body);
    return new Response(
      JSON.stringify([{ id: "request-1", ...insertedRecord }]),
      { status: 201, headers: { "content-type": "application/json" } },
    );
  };

  try {
    const response = createResponse();
    await handler(
      {
        method: "POST",
        body: {
          track: {
            id: "spotify-1",
            title: "Vivere",
            artist: "Vasco Rossi",
            cover: "https://i.scdn.co/cover.jpg",
            spotifyUrl: "https://open.spotify.com/track/spotify-1",
          },
          dedication: {
            recipient: "Martina",
            sender: "Antonio",
            message: "Questa è per te",
          },
          table: "7",
        },
      },
      response,
    );

    assert.equal(response.statusCode, 201);
    assert.equal(insertedRecord.status, "queued");
    assert.equal(insertedRecord.table_label, "Tavolo 7");
    assert.equal(insertedRecord.dedication_message, "Questa è per te");
    assert.equal(response.body.request.id, "request-1");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("requires a recipient when dedication is enabled", async () => {
  const response = createResponse();
  await handler(
    {
      method: "POST",
      body: {
        track: { id: "spotify-1", title: "Vivere", artist: "Vasco Rossi" },
        dedication: { recipient: "", message: "Per te" },
      },
    },
    response,
  );

  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /nome della persona/i);
});
