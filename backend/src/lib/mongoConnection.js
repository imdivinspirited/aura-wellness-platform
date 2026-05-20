/**
 * MongoDB Atlas / local Mongo — Mongoose connection (single pool).
 * Credentials come only from environment (DATABASE_URL or MONGODB_URI).
 */
import mongoose from 'mongoose';
import { getMongoConnectionString } from '../config.js';

/**
 * @param {string} uri
 * @returns {string | null} database name from path, or null if none
 */
export function extractDbNameFromUri(uri) {
  if (!uri || !uri.startsWith('mongodb')) return null;
  const noQuery = uri.split('?')[0];
  const afterScheme = noQuery.replace(/^mongodb(\+srv)?:\/\//, '');
  const pathStart = afterScheme.indexOf('/');
  if (pathStart === -1) return null;
  const path = afterScheme.slice(pathStart + 1);
  if (!path) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

/**
 * Resolves which logical DB name to use: explicit MONGO_DB_NAME > path in URI > dev fallback.
 */
export function resolveDbName() {
  const explicit = (process.env.MONGO_DB_NAME || '').trim();
  if (explicit) return explicit;
  const fromUri = extractDbNameFromUri(getMongoConnectionString());
  if (fromUri) return fromUri;
  return 'the_aolic_bangalore';
}

/**
 * Connects via Mongoose; on success the native driver DB is available at mongoose.connection.db.
 * Does not throw — returns { ok, error? } so the process can keep running.
 *
 * @returns {Promise<{ ok: boolean, error?: Error }>}
 */
export async function connectWithMongoose() {
  const uri = getMongoConnectionString();

  if (!uri || !uri.startsWith('mongodb')) {
    const msg =
      'No MongoDB URI: set MONGODB_URI (preferred) or MONGO_URL / DATABASE_URL (mongodb://...) in backend/.env.';
    console.warn('[mongo]', msg);
    console.error('MongoDB Connection Failed');
    console.error('[mongo] Fix: add MONGODB_URI to backend/.env and restart. Postgres DATABASE_URL values are ignored.');
    return { ok: false, error: new Error('DATABASE_NOT_CONFIGURED') };
  }

  const dbName = resolveDbName();
  const options = {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 15_000,
    dbName,
  };

  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB Connected');
      return { ok: true };
    }

    await mongoose.connect(uri, options);
    console.log('MongoDB Connected');
    console.log(`[mongo] database: "${dbName}"`);
    return { ok: true };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    console.error('MongoDB Connection Failed');
    console.error('[mongo]', e.message);
    if (e.stack) console.error('[mongo]', e.stack.split('\n').slice(0, 4).join('\n'));
    console.error(
      '[mongo] Suggested checks: (1) Atlas Network Access — allow your IP or 0.0.0.0/0 for testing; ' +
        '(2) user/password and URL-encoding special chars in password; ' +
        '(3) cluster host and replica set name; (4) DATABASE_URL / MONGODB_URI in backend/.env only.'
    );
    return { ok: false, error: e };
  }
}
