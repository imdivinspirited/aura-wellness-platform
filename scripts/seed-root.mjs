#!/usr/bin/env node
/**
 * Creates or updates root operator: password (Argon2) + secret phrase "Jay Gurudev" (Argon2 hash).
 * Usage: ROOT_SEED_PASSWORD='...' MONGODB_URI='...' node scripts/seed-root.mjs
 */
import 'dotenv/config';
import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';

const username = process.env.ROOT_SEED_USERNAME || 'root';
const password = process.env.ROOT_SEED_PASSWORD;
const mongoUri = process.env.MONGODB_URI || (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : '');
const dbName = process.env.MONGO_DB_NAME || 'aol_platform';

/** Must match what operators enter in Settings → Root Login (server verifies with Argon2). */
const ROOT_SECRET_PHRASE = process.env.ROOT_SECRET_PHRASE || 'Jay Gurudev';

if (!mongoUri || !password) {
  console.error('Set MONGODB_URI (or mongodb DATABASE_URL) and ROOT_SEED_PASSWORD');
  process.exit(1);
}

const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db(dbName);
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
const secretPhraseHash = await argon2.hash(ROOT_SECRET_PHRASE, { type: argon2.argon2id });

const existing = await db.collection('root_accounts').findOne({ username });
const id = existing?.id || randomUUID();

await db.collection('root_accounts').updateOne(
  { username },
  {
    $set: {
      id,
      username,
      password_hash: passwordHash,
      secret_phrase_hash: secretPhraseHash,
      display_name: 'Root',
    },
    $unset: { totp_secret: '' },
  },
  { upsert: true }
);

console.log('Root account ready.');
console.log('Username:', username);
console.log('Secret phrase for login UI (stored as Argon2 hash):', ROOT_SECRET_PHRASE);
console.log('(Optional) Override phrase: ROOT_SECRET_PHRASE=...');

await client.close();
