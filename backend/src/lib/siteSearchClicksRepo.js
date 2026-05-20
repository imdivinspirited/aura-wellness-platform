/**
 * Aggregated click counts for site search ranking (MongoDB).
 */
import { getDb, isMongoReady } from '../db.js';

/**
 * @param {string[]} docIds
 * @returns {Promise<Map<string, number>>}
 */
export async function getClickCountsByDocIds(docIds) {
  if (!isMongoReady() || !docIds.length) return new Map();
  const db = getDb();
  const rows = await db
    .collection('site_search_clicks')
    .find({ docId: { $in: docIds } })
    .project({ docId: 1, clicks: 1 })
    .toArray();
  const m = new Map();
  for (const r of rows) {
    if (typeof r.docId === 'string') m.set(r.docId, Number(r.clicks) || 0);
  }
  return m;
}

/**
 * @param {string} docId — stable id from search index (e.g. happiness-program)
 */
export async function incrementSiteSearchClick(docId) {
  if (!isMongoReady() || !docId || typeof docId !== 'string') return;
  const db = getDb();
  await db.collection('site_search_clicks').updateOne(
    { docId },
    { $inc: { clicks: 1 }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
}
