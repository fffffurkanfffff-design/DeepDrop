import { getStore } from "@netlify/blobs";

/*
 * Deep Drop - shared leaderboard.
 *
 *   GET  /api/scores   -> top 50 players, best haul first
 *   POST /api/scores   -> submit {name, best, deepest, casts}, returns the new top 50
 *
 * One blob per player (key "p/<slug>") rather than a single list blob. Two
 * players finishing a cast at the same moment then write different keys, so
 * neither overwrites the other - a single shared array would lose one of them.
 */

const STORE = "deep-drop";
const PREFIX = "p/";
const TOP_N = 50;
const MAX_NAME = 18;

/* Bounds: a haul above this is not reachable by playing, so treat it as junk. */
const MAX_BEST = 2000000;
const MAX_DEPTH = 1000;
const MAX_CASTS = 1000000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const fail = (message, status) => json({ error: message }, status);

/** Display name -> a stable blob key, so one player keeps one row. */
function slugFor(name) {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "skipper";
}

function cleanName(v) {
  return String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME);
}

function whole(v, max) {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}

async function readBoard(store) {
  const { blobs } = await store.list({ prefix: PREFIX });
  const rows = await Promise.all(
    blobs.map(async (b) => {
      try {
        return await store.get(b.key, { type: "json" });
      } catch {
        return null;
      }
    })
  );
  return rows
    .filter((r) => r && typeof r.name === "string")
    .sort((a, b) => (b.best || 0) - (a.best || 0))
    .slice(0, TOP_N);
}

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === "GET") {
    try {
      return json(await readBoard(store));
    } catch (e) {
      return fail("could not read the leaderboard", 500);
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return fail("expected a JSON body", 400);
    }

    const name = cleanName(body.name);
    if (!name) return fail("name is required", 400);

    const best = whole(body.best, MAX_BEST);
    const deepest = whole(body.deepest, MAX_DEPTH);
    const casts = whole(body.casts, MAX_CASTS);
    if (best === null) return fail("best must be a whole number in range", 400);
    if (deepest === null) return fail("deepest must be a whole number in range", 400);

    const key = PREFIX + slugFor(name);

    try {
      /* Keep whichever haul is bigger, so a stale tab cannot demote a record. */
      const prev = await store.get(key, { type: "json" }).catch(() => null);
      const row = {
        name,
        best: Math.max(best, prev?.best || 0),
        deepest: Math.max(deepest, prev?.deepest || 0),
        casts: Math.max(casts ?? 0, prev?.casts || 0),
        ts: Date.now(),
      };
      await store.setJSON(key, row);
      return json(await readBoard(store));
    } catch (e) {
      return fail("could not save that score", 500);
    }
  }

  return fail("method not allowed", 405);
};

export const config = { path: "/api/scores" };
