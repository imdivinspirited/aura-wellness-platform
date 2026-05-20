/**
 * GET/PUT /api/v1/users/profile/full — full profile for dashboard (native MongoDB users + user_profiles).
 * GET /api/v1/users/resume.pdf — PDF export (profile + achievements from user_activities).
 */
import { randomUUID } from 'crypto';
import { Router } from 'express';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../db.js';
import { authenticate, requireAuth } from '../middleware/authenticate.js';
import { sanitizeResumeDocument, serializeResumeDocument } from '../lib/resumeDocument.js';
import { pipeResumeA4Pdf } from '../lib/renderResumePdf.js';

const router = Router();

/** UUID v4 — public profile URLs use /u/:userId */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'avatars');

function publicUserRow(row) {
  const role = row.role || 'user';
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? '',
    phone: row.phone ?? '',
    role,
    roles: Array.isArray(row.roles) && row.roles.length ? row.roles : [role],
  };
}

/** Public view: no email, phone, WhatsApp, street address, or PIN. */
function serializePublicDetails(doc) {
  if (!doc) return null;
  return {
    avatarUrl: doc.avatar_url ?? '',
    avatarUpdatedAt: doc.avatar_updated_at
      ? (doc.avatar_updated_at instanceof Date ? doc.avatar_updated_at.toISOString() : String(doc.avatar_updated_at))
      : undefined,
    headline: doc.headline ?? '',
    bio: doc.bio ?? '',
    website: doc.website ?? '',
    instagram: doc.instagram ?? '',
    linkedin: doc.linkedin ?? '',
    city: doc.city ?? '',
    state: doc.state ?? '',
    country: doc.country ?? '',
    education: doc.education ?? '',
    skills: doc.skills ?? '',
  };
}

function serializeDetails(doc) {
  if (!doc) return null;
  return {
    avatarUrl: doc.avatar_url ?? '',
    avatarUpdatedAt: doc.avatar_updated_at
      ? (doc.avatar_updated_at instanceof Date ? doc.avatar_updated_at.toISOString() : String(doc.avatar_updated_at))
      : undefined,
    whatsapp: doc.whatsapp ?? '',
    age: doc.age ?? undefined,
    gender: doc.gender ?? '',
    city: doc.city ?? '',
    state: doc.state ?? '',
    country: doc.country ?? '',
    pincode: doc.pincode ?? '',
    addressLine: doc.address_line ?? '',
    education: doc.education ?? '',
    skills: doc.skills ?? '',
    availableFrom: doc.available_from
      ? (doc.available_from instanceof Date ? doc.available_from.toISOString() : String(doc.available_from))
      : undefined,
    duration: doc.duration ?? '',
    headline: doc.headline ?? '',
    bio: doc.bio ?? '',
    website: doc.website ?? '',
    instagram: doc.instagram ?? '',
    linkedin: doc.linkedin ?? '',
    wellnessMood: doc.wellness_mood ?? undefined,
    wellnessMoodUpdatedAt: doc.wellness_mood_updated_at
      ? doc.wellness_mood_updated_at instanceof Date
        ? doc.wellness_mood_updated_at.toISOString()
        : String(doc.wellness_mood_updated_at)
      : undefined,
    wellnessLastImprovementPercent:
      typeof doc.wellness_last_improvement_percent === 'number'
        ? doc.wellness_last_improvement_percent
        : undefined,
    wellnessLastActivityTitle: doc.wellness_last_activity_title ?? undefined,
  };
}

function extFromContentType(ct) {
  const t = String(ct || '').toLowerCase();
  if (t.includes('image/jpeg') || t.includes('image/jpg')) return 'jpg';
  if (t.includes('image/png')) return 'png';
  if (t.includes('image/webp')) return 'webp';
  return '';
}

async function safeUnlinkIfUnderUploads(urlOrPath) {
  try {
    if (typeof urlOrPath !== 'string' || !urlOrPath.startsWith('/uploads/avatars/')) return;
    const rel = urlOrPath.replace('/uploads/', ''); // avatars/...
    const abs = path.join(__dirname, '..', '..', 'uploads', rel);
    // extra guard: must stay inside uploads dir
    const uploadsAbs = path.join(__dirname, '..', '..', 'uploads') + path.sep;
    if (!abs.startsWith(uploadsAbs)) return;
    await fs.unlink(abs);
  } catch {
    /* ignore */
  }
}

async function removeAllAvatarVariantsForUser(userId) {
  const base = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!base) return;
  await fs.mkdir(uploadRoot, { recursive: true });
  const variants = [`${base}.jpg`, `${base}.png`, `${base}.webp`];
  await Promise.allSettled(variants.map((name) => fs.unlink(path.join(uploadRoot, name))));
}

/**
 * GET /api/v1/users/public/:userId — public profile (read-only; no login).
 * Share `/u/<userId>` on the site — excludes phone, email, and full postal address.
 */
router.get('/public/:userId', async (req, res) => {
  const userId = String(req.params.userId || '').trim();
  if (!UUID_RE.test(userId)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid profile link.' } });
  }
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: userId, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found.' } });
    }
    const details = await db.collection('user_profiles').findOne({ user_id: userId });
    const achievementRows = await db
      .collection('user_activities')
      .find({ user_id: userId, kind: 'achievement' })
      .sort({ created_at: -1 })
      .limit(12)
      .toArray();
    const achievements = achievementRows.map((a) => ({
      title: a.title ?? '',
      description: a.description || undefined,
      createdAt:
        a.created_at instanceof Date
          ? a.created_at.toISOString()
          : a.created_at
            ? new Date(a.created_at).toISOString()
            : undefined,
    }));

    return res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name ?? '' },
        details: serializePublicDetails(details),
        achievements,
      },
    });
  } catch (e) {
    console.error('[users/public GET]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to load profile.' } });
  }
});

/**
 * PUT /api/v1/users/profile/avatar/raw
 * Raw image upload (Content-Type: image/png|image/jpeg|image/webp).
 * Returns avatarUrl served via /uploads static.
 */
router.put(
  '/profile/avatar/raw',
  authenticate,
  requireAuth,
  express.raw({ type: ['image/png', 'image/jpeg', 'image/webp'], limit: '3mb' }),
  async (req, res) => {
    try {
      const ct = req.headers['content-type'];
      const ext = extFromContentType(ct);
      if (!ext) {
        return res.status(415).json({ success: false, error: { message: 'Unsupported image type' } });
      }
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length < 16) {
        return res.status(400).json({ success: false, error: { message: 'Invalid image payload' } });
      }

      const db = getDb();
      const now = new Date();
      const existing = await db.collection('user_profiles').findOne({ user_id: req.user.id });
      const prevUrl = existing?.avatar_url;

      await fs.mkdir(uploadRoot, { recursive: true });
      // Single avatar per user: deterministic filename; delete older variants first.
      await removeAllAvatarVariantsForUser(req.user.id);
      const assetId = `${req.user.id}.${ext}`;
      const filePath = path.join(uploadRoot, assetId);
      await fs.writeFile(filePath, buf);
      const avatarUrl = `/uploads/avatars/${assetId}`;

      if (existing) {
        await db.collection('user_profiles').updateOne(
          { user_id: req.user.id },
          {
            $set: {
              avatar_url: avatarUrl,
              avatar_updated_at: now,
              updated_at: now,
            },
          }
        );
      } else {
        await db.collection('user_profiles').insertOne({
          id: randomUUID(),
          user_id: req.user.id,
          avatar_url: avatarUrl,
          avatar_updated_at: now,
          created_at: now,
          updated_at: now,
        });
      }

      // Best-effort cleanup of previous local avatar
      await safeUnlinkIfUnderUploads(prevUrl);

      return res.json({ success: true, data: { avatarUrl } });
    } catch (e) {
      console.error('[users/profile/avatar/raw PUT]', e);
      return res.status(500).json({ success: false, error: { message: 'Failed to upload avatar.' } });
    }
  }
);

/** DELETE /api/v1/users/profile/avatar — remove avatar */
router.delete('/profile/avatar', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const existing = await db.collection('user_profiles').findOne({ user_id: req.user.id });
    const prevUrl = existing?.avatar_url;
    if (existing) {
      await db.collection('user_profiles').updateOne(
        { user_id: req.user.id },
        { $set: { avatar_url: null, avatar_updated_at: new Date(), updated_at: new Date() } }
      );
    }
    await removeAllAvatarVariantsForUser(req.user.id);
    await safeUnlinkIfUnderUploads(prevUrl);
    return res.json({ success: true });
  } catch (e) {
    console.error('[users/profile/avatar DELETE]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to remove avatar.' } });
  }
});

router.get('/resume.pdf', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.user.id, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    const details = await db.collection('user_profiles').findOne({ user_id: user.id });
    const resume = sanitizeResumeDocument(details?.resume_document);
    let achievements = [];
    try {
      achievements = await db
        .collection('user_activities')
        .find({ user_id: user.id, kind: 'achievement' })
        .sort({ created_at: -1 })
        .limit(40)
        .toArray();
    } catch {
      /* collection may not exist yet */
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');

    pipeResumeA4Pdf(res, { user, details, resume, achievements });
  } catch (e) {
    console.error('[users/resume.pdf]', e);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: { message: 'Failed to generate resume.' } });
    }
  }
});

router.get('/profile/full', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.user.id, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    const row = { ...user };
    delete row.password_hash;
    const details = await db.collection('user_profiles').findOne({ user_id: user.id });
    return res.json({
      success: true,
      data: {
        user: publicUserRow(row),
        details: serializeDetails(details),
        resume: serializeResumeDocument(details?.resume_document),
      },
    });
  } catch (e) {
    console.error('[users/profile/full GET]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to load profile.' } });
  }
});

router.put('/profile/full', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ id: req.user.id, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const { name, phone, details: bodyDetails, resume: bodyResume } = req.body || {};
    const now = new Date();
    const $setUser = { updated_at: now };
    if (typeof name === 'string' && name.trim()) $setUser.name = name.trim().slice(0, 200);
    if (typeof phone === 'string') $setUser.phone = phone.trim().slice(0, 48) || null;

    await db.collection('users').updateOne({ id: user.id }, { $set: $setUser });

    const updatedUser = await db.collection('users').findOne({ id: user.id });
    if (bodyDetails && typeof bodyDetails === 'object') {
      const d = bodyDetails;
      const prof = {
        user_id: user.id,
        updated_at: now,
      };
      if (d.headline !== undefined) prof.headline = String(d.headline).slice(0, 140);
      if (d.bio !== undefined) prof.bio = String(d.bio).slice(0, 4000);
      if (d.website !== undefined) prof.website = String(d.website).slice(0, 300);
      if (d.instagram !== undefined) prof.instagram = String(d.instagram).slice(0, 80);
      if (d.linkedin !== undefined) prof.linkedin = String(d.linkedin).slice(0, 200);
      if (d.whatsapp !== undefined) prof.whatsapp = String(d.whatsapp).slice(0, 64);
      if (d.age !== undefined && d.age !== null && d.age !== '') {
        const n = Number(d.age);
        if (!Number.isNaN(n)) prof.age = Math.min(120, Math.max(0, Math.floor(n)));
      }
      if (d.gender !== undefined) prof.gender = String(d.gender).slice(0, 32);
      if (d.city !== undefined) prof.city = String(d.city).slice(0, 120);
      if (d.state !== undefined) prof.state = String(d.state).slice(0, 120);
      if (d.country !== undefined) prof.country = String(d.country).slice(0, 120);
      if (d.pincode !== undefined) prof.pincode = String(d.pincode).slice(0, 24);
      if (d.addressLine !== undefined) prof.address_line = String(d.addressLine).slice(0, 500);
      if (d.education !== undefined) prof.education = String(d.education).slice(0, 500);
      if (d.skills !== undefined) prof.skills = String(d.skills).slice(0, 2000);
      if (d.duration !== undefined) prof.duration = String(d.duration).slice(0, 120);
      if (d.availableFrom) {
        const t = Date.parse(String(d.availableFrom));
        if (!Number.isNaN(t)) prof.available_from = new Date(t);
      }

      const hasDetailData = Object.keys(prof).some((k) => k !== 'user_id' && k !== 'updated_at');
      if (hasDetailData) {
        const existing = await db.collection('user_profiles').findOne({ user_id: user.id });
        if (existing) {
          await db.collection('user_profiles').updateOne(
            { user_id: user.id },
            { $set: { ...prof, updated_at: now } }
          );
        } else {
          await db.collection('user_profiles').insertOne({
            id: randomUUID(),
            ...prof,
            created_at: now,
          });
        }
      }
    }

    if (bodyResume && typeof bodyResume === 'object') {
      const sanitizedResume = sanitizeResumeDocument(bodyResume);
      const existingProf = await db.collection('user_profiles').findOne({ user_id: user.id });
      if (existingProf) {
        await db.collection('user_profiles').updateOne(
          { user_id: user.id },
          { $set: { resume_document: sanitizedResume, updated_at: now } }
        );
      } else {
        await db.collection('user_profiles').insertOne({
          id: randomUUID(),
          user_id: user.id,
          resume_document: sanitizedResume,
          created_at: now,
          updated_at: now,
        });
      }
    }

    const details = await db.collection('user_profiles').findOne({ user_id: user.id });
    const u = { ...updatedUser };
    delete u.password_hash;
    return res.json({
      success: true,
      data: {
        user: publicUserRow(u),
        details: serializeDetails(details),
        resume: serializeResumeDocument(details?.resume_document),
      },
    });
  } catch (e) {
    console.error('[users/profile/full PUT]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to save profile.' } });
  }
});

/** GET /users/activities — list current user's activities (optional ?kind=achievement) */
router.get('/activities', authenticate, requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const q = { user_id: req.user.id };
    const kind = typeof req.query.kind === 'string' ? req.query.kind.trim() : '';
    if (kind) q.kind = kind;
    const rows = await db
      .collection('user_activities')
      .find(q)
      .sort({ created_at: -1 })
      .limit(200)
      .toArray();
    const iso = (x) => {
      if (!x) return undefined;
      const d = x instanceof Date ? x : new Date(x);
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    };
    const items = rows.map((row) => ({
      _id: row.id,
      userId: row.user_id,
      kind: row.kind,
      title: row.title ?? '',
      org: row.org ?? undefined,
      department: row.department ?? undefined,
      location: row.location ?? undefined,
      startDate: iso(row.start_date),
      endDate: iso(row.end_date),
      hours: row.hours,
      description: row.description ?? undefined,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
    }));
    return res.json({ success: true, data: { items } });
  } catch (e) {
    console.error('[users/activities GET]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to list activities.' } });
  }
});

/** POST /users/activities */
router.post('/activities', authenticate, requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const kind = typeof b.kind === 'string' ? b.kind.trim() : '';
    const title = typeof b.title === 'string' ? b.title.trim() : '';
    if (!kind || !title) {
      return res.status(400).json({ success: false, error: { message: 'kind and title are required' } });
    }
    const now = new Date();
    const id = randomUUID();
    const doc = {
      id,
      user_id: req.user.id,
      kind,
      title: title.slice(0, 500),
      org: typeof b.org === 'string' ? b.org.slice(0, 200) : null,
      department: typeof b.department === 'string' ? b.department.slice(0, 200) : null,
      location: typeof b.location === 'string' ? b.location.slice(0, 200) : null,
      start_date: b.startDate ? new Date(b.startDate) : null,
      end_date: b.endDate ? new Date(b.endDate) : null,
      hours: typeof b.hours === 'number' && !Number.isNaN(b.hours) ? b.hours : null,
      description: typeof b.description === 'string' ? b.description.slice(0, 8000) : null,
      created_at: now,
      updated_at: now,
    };
    await getDb().collection('user_activities').insertOne(doc);
    const item = {
      _id: id,
      userId: req.user.id,
      kind: doc.kind,
      title: doc.title,
      org: doc.org ?? undefined,
      department: doc.department ?? undefined,
      location: doc.location ?? undefined,
      startDate: doc.start_date ? doc.start_date.toISOString() : undefined,
      endDate: doc.end_date ? doc.end_date.toISOString() : undefined,
      hours: doc.hours ?? undefined,
      description: doc.description ?? undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    return res.status(201).json({ success: true, data: { item } });
  } catch (e) {
    console.error('[users/activities POST]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to create activity.' } });
  }
});

/** DELETE /users/activities/:id */
router.delete('/activities/:id', authenticate, requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return res.status(400).json({ success: false, error: { message: 'Missing id' } });
    }
    const r = await getDb()
      .collection('user_activities')
      .deleteOne({ id, user_id: req.user.id });
    if (r.deletedCount === 0) {
      return res.status(404).json({ success: false, error: { message: 'Not found' } });
    }
    return res.json({ success: true });
  } catch (e) {
    console.error('[users/activities DELETE]', e);
    return res.status(500).json({ success: false, error: { message: 'Failed to delete.' } });
  }
});

export default router;
