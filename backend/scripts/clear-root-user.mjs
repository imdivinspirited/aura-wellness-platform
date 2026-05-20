/**
 * Deletes root operator document(s) from `users` so you can run Root sign up again (local dev).
 * Does NOT touch `root_accounts` (legacy collection).
 *
 * Run: cd backend && CONFIRM_CLEAR_ROOT=yes npm run clear-root
 */
import { connectMongo, isMongoReady, getDb } from '../src/db.js';

if (process.env.CONFIRM_CLEAR_ROOT !== 'yes') {
  console.error('Refusing to delete: set CONFIRM_CLEAR_ROOT=yes');
  console.error('Example: CONFIRM_CLEAR_ROOT=yes npm run clear-root');
  process.exit(1);
}

await connectMongo();
if (!isMongoReady()) {
  console.error('MongoDB is not connected.');
  process.exit(1);
}

const db = getDb();
const r = await db.collection('users').deleteMany({ role: 'root', deleted_at: null });
console.log(`\nDeleted ${r.deletedCount} root user document(s) from \`users\`. You can sign up again.\n`);
