/**
 * Public: POST interest for an event (Gurudev birthday, etc.)
 * Root-only: GET list for outreach / contact
 */
import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';
import { authenticate, requireAuth } from '../middleware/authenticate.js';
import { requireRoot } from '../middleware/requireRoles.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';

const router = Router();

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,78}$/i;

function mapDoc(doc) {
  return {
    id: doc.id,
    eventSlug: doc.event_slug,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    city: doc.city ?? null,
    vibe: doc.vibe ?? null,
    note: doc.note ?? null,
    updatesOk: Boolean(doc.updates_ok),
    createdAt: doc.created_at instanceof Date ? doc.created_at.toISOString() : doc.created_at,
    updatedAt:
      doc.updated_at instanceof Date
        ? doc.updated_at.toISOString()
        : doc.updated_at || null,
  };
}

/** Root-only: list registrations (optional ?eventSlug=) */
router.get('/interest/registrations', authenticate, requireAuth, requireRoot, async (req, res) => {
  let db;
  try {
    db = getDb();
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    throw err;
  }

  const eventSlug = typeof req.query.eventSlug === 'string' ? req.query.eventSlug.trim() : '';
  const filter = {};
  if (eventSlug && SLUG_RE.test(eventSlug)) {
    filter.event_slug = eventSlug;
  }

  try {
    const rows = await db
      .collection('event_interest_registrations')
      .find(filter)
      .sort({ created_at: -1 })
      .limit(500)
      .toArray();
    res.json({
      success: true,
      data: { registrations: rows.map(mapDoc) },
    });
  } catch (e) {
    console.error('[events/interest/registrations]', e);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Could not load registrations.' },
    });
  }
});

/** Public: save interest (contact details for team follow-up) */
router.post('/:eventSlug/interest', async (req, res) => {
  let db;
  try {
    db = getDb();
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    throw err;
  }

  const eventSlug = String(req.params.eventSlug || '').trim();
  if (!SLUG_RE.test(eventSlug)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SLUG', message: 'Invalid event.' },
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phoneRaw = String(body.phone || '').trim();
  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const city = body.city != null ? String(body.city).trim() : '';
  const vibe = body.vibe != null ? String(body.vibe).trim() : '';
  const note = body.note != null ? String(body.note).trim() : '';
  const updatesOk = body.updatesOk !== false;

  if (name.length < 2) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Please enter your name.' },
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Please enter a valid email.' },
    });
  }
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Please enter a valid phone number (with country code if needed).' },
    });
  }

  const now = new Date();
  const coll = db.collection('event_interest_registrations');

  try {
    const existing = await coll.findOne({ event_slug: eventSlug, email });
    const base = {
      event_slug: eventSlug,
      name,
      email,
      phone: phoneRaw,
      city: city || undefined,
      vibe: vibe || undefined,
      note: note || undefined,
      updates_ok: updatesOk,
      updated_at: now,
    };

    if (existing) {
      await coll.updateOne(
        { id: existing.id },
        { $set: { ...base } }
      );
      return res.json({
        success: true,
        data: { id: existing.id, updated: true },
      });
    }

    const id = randomUUID();
    await coll.insertOne({
      id,
      ...base,
      created_at: now,
    });
    res.status(201).json({
      success: true,
      data: { id },
    });
  } catch (e) {
    console.error('[events/:slug/interest]', e);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Could not save. Try again later.' },
    });
  }
});

export default router;
