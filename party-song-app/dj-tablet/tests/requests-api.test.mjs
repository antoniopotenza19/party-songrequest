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

function withSupabaseEnvironment() {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://party.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";

  return () => {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  };
}

test("returns the shared queue ordered by arrival", async () => {
  const originalFetch = globalThis.fetch;
  const restoreEnvironment = withSupabaseEnvironment();
  const rows = [
    {
      id: "request-1",
      status: "queued",
      title: "Vivere",
      artist: "Vasco Rossi",
    },
  ];

  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /order=created_at\.asc$/);
    assert.equal(options.headers.Authorization, "Bearer service-role-test");
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const response = createResponse();
    await handler({ method: "GET", query: {} }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.requests, rows);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});

test("Metti ora moves the request directly to played", async () => {
  const originalFetch = globalThis.fetch;
  const restoreEnvironment = withSupabaseEnvironment();
  let update;

  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /song_requests\?id=eq\.request-1$/);
    update = JSON.parse(options.body);
    return new Response(JSON.stringify([{ id: "request-1", ...update }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const response = createResponse();
    await handler(
      {
        method: "PATCH",
        query: {},
        body: { id: "request-1", status: "played" },
      },
      response,
    );

    assert.equal(response.statusCode, 200);
    assert.equal(update.status, "played");
    assert.ok(update.played_at);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnvironment();
  }
});
