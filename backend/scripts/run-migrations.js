#!/usr/bin/env node
/**
 * PostgreSQL migrations under database/migrations/ are legacy.
 * MongoDB indexes are created automatically when the API connects (see src/db.js).
 *
 * Optional: verify connection only.
 */
import '../src/bootstrap.js';
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : '');
const dbName = process.env.MONGO_DB_NAME || 'aol_platform';

async function main() {
  if (!mongoUri) {
    console.log('No MONGODB_URI — nothing to migrate. Indexes are ensured on API startup.');
    return;
  }
  const client = new MongoClient(mongoUri);
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  await client.close();
  console.log('MongoDB reachable. Start the API to ensure indexes.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
