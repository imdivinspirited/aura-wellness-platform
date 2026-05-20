import { createHash, randomBytes } from 'crypto';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';

export function hashToken(raw) {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function generateRefreshTokenRaw() {
  return randomBytes(48).toString('base64url');
}

export async function saveRefreshToken(userId, rawToken, meta = {}) {
  let ttlDays = meta.ttlDays ?? 30;
  if (!Number.isFinite(ttlDays) || ttlDays <= 0) ttlDays = 30;
  ttlDays = Math.min(365, Math.max(1, ttlDays));
  const tokenHash = hashToken(rawToken);
  const familyId = meta.familyId || randomUUID();
  const ttlMs = meta.ttlMs;
  const expiresAt =
    ttlMs != null && Number.isFinite(ttlMs)
      ? new Date(Date.now() + ttlMs)
      : new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  const id = randomUUID();
  const db = getDb();
  await db.collection('refresh_tokens').insertOne({
    id,
    user_id: userId,
    token_hash: tokenHash,
    family_id: familyId,
    parent_id: meta.parentId || null,
    user_agent: meta.userAgent || null,
    ip: meta.ip || null,
    expires_at: expiresAt,
    revoked_at: null,
    created_at: new Date(),
    session_kind: meta.sessionKind || 'user',
  });
  return { dbId: id, familyId, expiresAt };
}

export async function findValidRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const db = getDb();
  const row = await db.collection('refresh_tokens').findOne({ token_hash: tokenHash });
  if (!row) return null;
  if (new Date(row.expires_at) <= new Date()) return null;
  if (row.revoked_at) {
    /** Rotated refresh reused — likely theft; kill the whole session family. */
    if (row.family_id) {
      try {
        await revokeEntireFamily(row.family_id);
      } catch {
        /* ignore */
      }
    }
    return null;
  }
  return row;
}

export async function revokeRefreshTokenId(id) {
  const db = getDb();
  await db
    .collection('refresh_tokens')
    .updateOne({ id }, { $set: { revoked_at: new Date() } });
}

export async function revokeEntireFamily(familyId) {
  const db = getDb();
  await db.collection('refresh_tokens').updateMany(
    { family_id: familyId, revoked_at: null },
    { $set: { revoked_at: new Date() } }
  );
}

/** Rotation: revoke old row, issue new token in same family. */
export async function rotateRefreshToken(oldRow, rawNew, meta) {
  await revokeRefreshTokenId(oldRow.id);
  return saveRefreshToken(oldRow.user_id, rawNew, {
    ...meta,
    familyId: oldRow.family_id,
    parentId: oldRow.id,
    ttlDays: meta.ttlDays ?? 30,
    sessionKind: oldRow.session_kind || meta.sessionKind || 'user',
  });
}

export async function revokeAccessJti(jti, userId, expiresAtIso) {
  const db = getDb();
  const expiresAt = new Date(expiresAtIso);
  await db.collection('access_token_revocations').updateOne(
    { jti },
    {
      $setOnInsert: {
        jti,
        user_id: userId,
        expires_at: expiresAt,
        created_at: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function isJtiRevoked(jti) {
  const db = getDb();
  const doc = await db.collection('access_token_revocations').findOne({
    jti,
    expires_at: { $gt: new Date() },
  });
  return !!doc;
}
