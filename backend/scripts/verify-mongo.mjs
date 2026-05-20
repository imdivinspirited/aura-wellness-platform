/**
 * Check MongoDB: URI present, connection OK, optional read/write probe.
 * Run from repo: node backend/scripts/verify-mongo.mjs
 * Or: cd backend && node scripts/verify-mongo.mjs
 */
import mongoose from 'mongoose';
import { connectMongo, isMongoReady } from '../src/db.js';

const PROBE = '__mongo_probe__';

async function main() {
  console.log('[verify-mongo] Connecting…');
  await connectMongo();

  if (!isMongoReady()) {
    console.error('\n❌ RESULT: MongoDB is NOT connected.');
    console.error('   → Set MONGODB_URI in backend/.env (or repo root .env).');
    console.error('   → Atlas: Network Access must allow your IP; user/password correct.\n');
    process.exit(1);
  }

  const db = mongoose.connection.db;
  if (!db) {
    console.error('❌ No native Db handle.');
    process.exit(1);
  }

  const name = db.databaseName;
  const cols = await db.listCollections().toArray();
  const colNames = cols.map((c) => c.name).sort();

  let pagesCount = 0;
  try {
    pagesCount = await db.collection('pages').countDocuments();
  } catch {
    /* ignore */
  }

  console.log('\n✅ RESULT: MongoDB is connected and working.');
  console.log(`   Database name: ${name}`);
  console.log(`   Collections (${colNames.length}): ${colNames.slice(0, 20).join(', ') || '(none yet)'}${colNames.length > 20 ? '…' : ''}`);
  console.log(`   pages collection: ${pagesCount} document(s) (visual editor)`);

  // Tiny write/read/delete probe (proves writes work)
  try {
    await db.collection('_health_probes').insertOne({ key: PROBE, at: new Date() });
    const found = await db.collection('_health_probes').findOne({ key: PROBE });
    await db.collection('_health_probes').deleteMany({ key: PROBE });
    if (found) {
      console.log('   Write test: OK (insert + read + delete on _health_probes)\n');
    }
  } catch (e) {
    console.warn('   Write test failed:', e?.message || e);
  }

  await mongoose.connection.close().catch(() => {});
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
