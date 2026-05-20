/**
 * MongoDB connection — single database for auth, CMS, mood, audit.
 * Uses Mongoose for Atlas-friendly pooling; exposes native Db via getDb() for existing routes.
 */
import mongoose from 'mongoose';
import { getMongoConnectionString } from './config.js';
import { connectWithMongoose } from './lib/mongoConnection.js';
import { ensureInAppNotificationIndexes } from './lib/inAppNotificationsRepo.js';

/** @type {import('mongodb').Db | null} */
let db;

/**
 * Create indexes for production-like constraints (unique emails, token hashes, etc.)
 * @param {import('mongodb').Db} database
 */
async function ensureIndexes(database) {
  // NOTE: unique+sparse will still index documents where the field exists but is null.
  // We prefer partial indexes so many docs without phone/username don't collide on null.
  try {
    await database.collection('users').dropIndex('email_1');
  } catch {
    /* ignore */
  }
  try {
    await database.collection('users').dropIndex('phone_1');
  } catch {
    /* ignore */
  }
  try {
    await database.collection('users').dropIndex('username_1');
  } catch {
    /* ignore */
  }

  await database.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, partialFilterExpression: { email: { $type: 'string' } } },
    { key: { phone: 1 }, unique: true, partialFilterExpression: { phone: { $type: 'string' } } },
    { key: { username: 1 }, unique: true, partialFilterExpression: { username: { $type: 'string' } } },
    { key: { id: 1 }, unique: true },
  ]);
  await database.collection('refresh_tokens').createIndexes([
    { key: { token_hash: 1 }, unique: true },
    { key: { user_id: 1 } },
    { key: { family_id: 1 } },
  ]);
  await database.collection('access_token_revocations').createIndexes([{ key: { jti: 1 }, unique: true }]);
  await database.collection('auth_tokens').createIndexes([{ key: { token_hash: 1 } }]);
  await database.collection('device_signups').createIndexes([
    { key: { device_id: 1, email: 1 }, unique: true },
    { key: { device_id: 1 } },
  ]);
  await database.collection('signup_watches').createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { email: 1 } },
  ]);
  await database.collection('anonymous_guests').createIndexes([{ key: { id: 1 }, unique: true }]);
  await database.collection('root_accounts').createIndexes([{ key: { username: 1 }, unique: true }]);
  await database.collection('cms_programs').createIndexes([{ key: { slug: 1 }, unique: true }]);
  await database.collection('cms_events').createIndexes([{ key: { slug: 1 }, unique: true }]);
  await database.collection('cms_services').createIndexes([{ key: { slug: 1 }, unique: true }]);
  await database.collection('cms_pages').createIndexes([{ key: { slug: 1 }, unique: true }]);
  await database.collection('pages').createIndexes([{ key: { slug: 1 }, unique: true }]);
  await database.collection('mood_entries').createIndexes([
    { key: { recorded_at: -1 } },
    { key: { user_id: 1, recorded_at: -1 }, sparse: true },
    { key: { anonymous_id: 1, recorded_at: -1 }, sparse: true },
  ]);
  await database.collection('mood_activity_feedback').createIndexes([
    { key: { recorded_at: -1 } },
    { key: { user_id: 1, recorded_at: -1 }, sparse: true },
    { key: { anonymous_id: 1, recorded_at: -1 }, sparse: true },
  ]);
  await database.collection('user_profiles').createIndexes([
    { key: { user_id: 1 }, unique: true },
    { key: { id: 1 }, unique: true, sparse: true },
  ]);
  await database.collection('user_activities').createIndexes([
    { key: { id: 1 }, unique: true, sparse: true },
    { key: { user_id: 1, kind: 1 } },
    { key: { user_id: 1, created_at: -1 } },
  ]);
  await database.collection('event_interest_registrations').createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { event_slug: 1, created_at: -1 } },
    { key: { event_slug: 1, email: 1 }, unique: true },
  ]);
  try {
    await database.collection('brute_lockouts').createIndexes([
      { key: { updated_at: 1 }, expireAfterSeconds: 60 * 60 * 24 * 45 },
    ]);
  } catch {
    /* ignore duplicate / migration */
  }
  try {
    await ensureInAppNotificationIndexes(database);
  } catch (e) {
    console.warn('[db] in_app_notifications indexes:', e?.message || e);
  }
  try {
    await database.collection('notification_dispatch_log').createIndexes([{ key: { key: 1 }, unique: true }]);
  } catch (e) {
    console.warn('[db] notification_dispatch_log indexes:', e?.message || e);
  }
  try {
    await database.collection('notification_worker_state').createIndexes([{ key: { _id: 1 } }]);
  } catch {
    /* ignore */
  }
  try {
    await database.collection('site_search_clicks').createIndexes([
      { key: { docId: 1 }, unique: true },
      { key: { clicks: -1 } },
    ]);
  } catch (e) {
    console.warn('[db] site_search_clicks indexes:', e?.message || e);
  }
}

export async function connectMongo() {
  if (db) return db;

  const uriForLog = getMongoConnectionString();
  if (!uriForLog) {
    console.warn('[db] No MongoDB URI in env. Set MONGODB_URI (or MONGO_URL / DATABASE_URL starting with mongodb) in backend/.env.');
    return null;
  }

  const { ok } = await connectWithMongoose();
  if (!ok || mongoose.connection.readyState !== 1) {
    db = null;
    return null;
  }

  try {
    const nativeDb = mongoose.connection.db;
    if (!nativeDb) {
      console.error('[db] Mongoose connected but native Db handle is missing.');
      db = null;
      return null;
    }
    db = nativeDb;
    await ensureIndexes(db);
    console.log(`[db] indexes ensured on "${db.databaseName}"`);
    return db;
  } catch (e) {
    console.error('[db] Post-connect setup failed:', e?.message || e);
    db = null;
    return null;
  }
}

/** @returns {import('mongodb').Db} */
export function getDb() {
  if (!db) {
    const hasUri = Boolean(getMongoConnectionString());
    const err = new Error(
      hasUri
        ? 'MongoDB is not connected yet or the connection failed.'
        : 'No MongoDB URI is configured. Set MONGODB_URI (or MONGO_URL / DATABASE_URL for mongodb://) in backend/.env.'
    );
    err.code = hasUri ? 'MONGO_UNAVAILABLE' : 'DATABASE_NOT_CONFIGURED';
    throw err;
  }
  return db;
}

export function isMongoReady() {
  return !!db;
}
