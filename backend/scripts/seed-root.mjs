#!/usr/bin/env node
/**
 * Creates or updates a root operator (password + TOTP secret) in MongoDB.
 * Usage: ROOT_SEED_PASSWORD='...' MONGODB_URI='...' node scripts/seed-root.mjs
 */
import 'dotenv/config';
import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';
import { authenticator } from 'otplib';

const username = process.env.ROOT_SEED_USERNAME || 'root';
const password = process.env.ROOT_SEED_PASSWORD;
const mongoUri = process.env.MONGODB_URI || (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : '');
const dbName = process.env.MONGO_DB_NAME || 'aol_platform';

if (!mongoUri || !password) {
  console.error('Set MONGODB_URI (or mongodb DATABASE_URL) and ROOT_SEED_PASSWORD');
  process.exit(1);
}

const secret = authenticator.generateSecret();
const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db(dbName);
const hash = await argon2.hash(password, { type: argon2.argon2id });

const existing = await db.collection('root_accounts').findOne({ username });
const id = existing?.id || randomUUID();

await db.collection('root_accounts').updateOne(
  { username },
  {
    $set: {
      id,
      username,
      password_hash: hash,
      totp_secret: secret,
      display_name: 'Root',
    },
  },
  { upsert: true }
);

console.log('Root account ready.');
console.log('Username:', username);
console.log('TOTP secret (add to Google Authenticator):', secret);
console.log('OTP auth URL:', authenticator.keyuri(username, 'ArtOfLiving-Root', secret));

await client.close();
