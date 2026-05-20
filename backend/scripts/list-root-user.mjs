/**
 * Print the root operator row in `users` (role=root) so you know which email/password to use,
 * or that a test signup blocked your own sign-up.
 *
 * Run: cd backend && npm run list-root
 */
import { connectMongo, isMongoReady, getDb } from '../src/db.js';

await connectMongo();
if (!isMongoReady()) {
  console.error('MongoDB is not connected. Set MONGODB_URI in backend/.env.');
  process.exit(1);
}

const db = getDb();
const u = await db.collection('users').findOne({ role: 'root', deleted_at: null });

if (!u) {
  console.log('\nNo root user in `users`. You can use Root sign up in the app.\n');
  process.exit(0);
}

console.log('\nRoot user in database `users`:');
console.log('  email:', u.email);
console.log('  name:', u.name ?? '(none)');
console.log('  id:', u.id);
console.log('  created_at:', u.created_at ?? '(none)');
console.log('\nSign in with that email + the password used at signup + ROOT_SECRET_KEY.\n');
