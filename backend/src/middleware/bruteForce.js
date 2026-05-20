/**
 * Login / 2FA lockout: in-memory + MongoDB `brute_lockouts` so multiple API instances share limits.
 */

import { getDb, isMongoReady } from '../db.js';

const COL = 'brute_lockouts';

function key(ip, identifier) {
  return `${ip}|${String(identifier).toLowerCase()}`;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAIL = 5;
const BASE_LOCK_MS = 15 * 60 * 1000;

/** Process-local cache to cut Mongo reads on hot paths */
const mem = new Map();

/**
 * @param {string} k
 * @returns {Promise<{ since: number; count: number; lockedUntil: number } | null>}
 */
async function loadState(k) {
  const m = mem.get(k);
  if (m) return m;
  if (isMongoReady()) {
    try {
      const db = getDb();
      const d = await db.collection(COL).findOne({ _id: k });
      if (d) {
        const e = {
          since: new Date(d.since).getTime(),
          count: d.count,
          lockedUntil: d.locked_until ? new Date(d.locked_until).getTime() : 0,
        };
        mem.set(k, e);
        return e;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * @param {string} k
 * @param {{ since: number; count: number; lockedUntil: number }} e
 */
async function persistState(k, e) {
  mem.set(k, e);
  if (isMongoReady()) {
    try {
      const db = getDb();
      await db.collection(COL).updateOne(
        { _id: k },
        {
          $set: {
            since: new Date(e.since),
            count: e.count,
            locked_until: e.lockedUntil ? new Date(e.lockedUntil) : null,
            updated_at: new Date(),
          },
        },
        { upsert: true }
      );
    } catch {
      /* ignore */
    }
  }
}

async function deleteState(k) {
  mem.delete(k);
  if (isMongoReady()) {
    try {
      await getDb().collection(COL).deleteOne({ _id: k });
    } catch {
      /* ignore */
    }
  }
}

export async function recordFailure(ip, identifier) {
  const k = key(ip, identifier);
  const now = Date.now();
  let e = await loadState(k);
  if (!e || now - e.since > WINDOW_MS) {
    e = { since: now, count: 0, lockedUntil: 0 };
  }
  e.count += 1;
  if (e.count >= MAX_FAIL) {
    const exponent = Math.min(e.count - MAX_FAIL, 6);
    e.lockedUntil = now + BASE_LOCK_MS * 2 ** exponent;
  }
  await persistState(k, e);
  return e;
}

export async function clearFailures(ip, identifier) {
  await deleteState(key(ip, identifier));
}

export async function isLockedOut(ip, identifier) {
  const k = key(ip, identifier);
  const e = await loadState(k);
  if (!e) return false;
  if (Date.now() < e.lockedUntil) return true;
  if (e.lockedUntil && Date.now() >= e.lockedUntil) {
    await deleteState(k);
  }
  return false;
}

export async function lockoutRemainingMs(ip, identifier) {
  const e = await loadState(key(ip, identifier));
  if (!e || !e.lockedUntil) return 0;
  return Math.max(0, e.lockedUntil - Date.now());
}
