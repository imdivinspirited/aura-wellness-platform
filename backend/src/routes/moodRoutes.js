import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';
import { authenticate, requireAuth } from '../middleware/authenticate.js';

const router = Router();

const UI_MOODS = new Set(['happy', 'calm', 'neutral', 'sad', 'depressed', 'stressed']);

function dbUnavailable(res, err) {
  return respondIfMongoOrDbUnavailable(res, err);
}

/**
 * Authenticated: mood history for charts (last N days).
 */
router.get('/summary', authenticate, requireAuth, async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(String(req.query.days || '30'), 10) || 30));
  try {
    const db = getDb();
    const since = new Date(Date.now() - days * 86400000);
    const entries = await db
      .collection('mood_entries')
      .find({ user_id: req.user.id, recorded_at: { $gte: since } })
      .sort({ recorded_at: -1 })
      .toArray();
    const counts = {};
    for (const e of entries) {
      const m = e.mood || 'unknown';
      counts[m] = (counts[m] || 0) + 1;
    }
    const latest = entries.length ? { mood: entries[0].mood, recorded_at: entries[0].recorded_at } : null;
    return res.json({
      success: true,
      data: {
        latest,
        counts,
      },
    });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    console.error('[mood/summary]', err);
    return res.status(500).json({ success: false, error: { message: 'Failed to load mood summary.' } });
  }
});

/**
 * Public or authenticated: persist mood (anonymous_id for guests; user_id when Bearer token sent).
 */
router.post('/entries', authenticate, async (req, res) => {
  const mood = req.body?.mood;
  const anonymous_id = req.body?.anonymous_id;
  const note = req.body?.note;
  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ success: false, error: { message: 'mood is required' } });
  }
  const trimmedMood = mood.trim();
  const allowed = new Set([
    // UI mood check modal
    'happy',
    'calm',
    'neutral',
    'sad',
    'depressed',
    'stressed',
    // API mood values
    'great',
    'good',
    'okay',
    'anxious',
    'angry',
    'tired',
  ]);
  if (!allowed.has(trimmedMood)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid mood value' } });
  }
  try {
    const db = getDb();
    const userId = req.user?.id || null;
    const safeNote =
      typeof note === 'string' && note.trim()
        ? note.trim().slice(0, 500)
        : null;
    await db.collection('mood_entries').insertOne({
      id: randomUUID(),
      mood: trimmedMood,
      note: safeNote,
      anonymous_id: userId ? null : typeof anonymous_id === 'string' ? anonymous_id : null,
      user_id: userId,
      recorded_at: new Date(),
    });
    return res.json({ success: true });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    console.error('[mood/entries]', err);
    return res.status(500).json({ success: false, error: { message: 'Failed to save mood.' } });
  }
});

/**
 * After a guided session (e.g. meditation): improvement %, optional new mood, persist feedback + profile.
 * Auth optional: guests send anonymous_id in body (same as mood entries).
 */
router.post('/activity-feedback', authenticate, async (req, res) => {
  const body = req.body || {};
  const before_mood = typeof body.before_mood === 'string' ? body.before_mood.trim() : '';
  const after_mood =
    body.after_mood == null || body.after_mood === ''
      ? null
      : typeof body.after_mood === 'string'
        ? body.after_mood.trim()
        : null;
  const rawPct = body.improvement_percent;
  const improvement_percent =
    typeof rawPct === 'number'
      ? rawPct
      : typeof rawPct === 'string'
        ? parseInt(rawPct, 10)
        : NaN;
  const activity_type =
    typeof body.activity_type === 'string' ? body.activity_type.trim().slice(0, 80) : '';
  const activity_title =
    typeof body.activity_title === 'string' ? body.activity_title.trim().slice(0, 220) : '';
  const youtube_video_id =
    typeof body.youtube_video_id === 'string' ? body.youtube_video_id.trim().slice(0, 32) : '';
  const anonymous_id =
    typeof body.anonymous_id === 'string' ? body.anonymous_id.trim().slice(0, 64) : null;

  if (!before_mood || !UI_MOODS.has(before_mood)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid or missing before_mood.' } });
  }
  if (after_mood != null && !UI_MOODS.has(after_mood)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid after_mood.' } });
  }
  if (!Number.isFinite(improvement_percent) || improvement_percent < 0 || improvement_percent > 100) {
    return res.status(400).json({
      success: false,
      error: { message: 'improvement_percent must be between 0 and 100.' },
    });
  }

  try {
    const db = getDb();
    const userId = req.user?.id || null;
    const aid = userId ? null : anonymous_id;

    const doc = {
      id: randomUUID(),
      user_id: userId,
      anonymous_id: aid,
      before_mood,
      after_mood,
      improvement_percent,
      activity_type: activity_type || null,
      activity_title: activity_title || null,
      youtube_video_id: youtube_video_id || null,
      recorded_at: new Date(),
    };

    await db.collection('mood_activity_feedback').insertOne(doc);

    /** Mirror a mood check-in when user reports how they feel after the activity */
    if (after_mood) {
      const note = `Activity: ${activity_title || activity_type || 'session'} · felt ${improvement_percent}% better`;
      await db.collection('mood_entries').insertOne({
        id: randomUUID(),
        mood: after_mood,
        note: note.slice(0, 500),
        anonymous_id: aid,
        user_id: userId,
        recorded_at: new Date(),
      });
    }

    if (userId && after_mood) {
      const now = new Date();
      const existing = await db.collection('user_profiles').findOne({ user_id: userId });
      const patch = {
        wellness_mood: after_mood,
        wellness_mood_updated_at: now,
        wellness_last_improvement_percent: improvement_percent,
        wellness_last_activity_title: activity_title || activity_type || null,
        updated_at: now,
      };
      if (existing) {
        await db.collection('user_profiles').updateOne({ user_id: userId }, { $set: patch });
      } else {
        await db.collection('user_profiles').insertOne({
          id: randomUUID(),
          user_id: userId,
          created_at: now,
          ...patch,
        });
      }
    }

    return res.json({ success: true, data: { id: doc.id } });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    console.error('[mood/activity-feedback]', err);
    return res.status(500).json({ success: false, error: { message: 'Failed to save feedback.' } });
  }
});

/**
 * Recent wellness session feedback (logged-in users).
 */
router.get('/activity-feedback/recent', authenticate, requireAuth, async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '8'), 10) || 8));
  try {
    const db = getDb();
    const rows = await db
      .collection('mood_activity_feedback')
      .find({ user_id: req.user.id })
      .sort({ recorded_at: -1 })
      .limit(limit)
      .toArray();
    const data = rows.map((r) => ({
      id: r.id,
      before_mood: r.before_mood,
      after_mood: r.after_mood,
      improvement_percent: r.improvement_percent,
      activity_title: r.activity_title,
      activity_type: r.activity_type,
      youtube_video_id: r.youtube_video_id,
      recorded_at: r.recorded_at instanceof Date ? r.recorded_at.toISOString() : String(r.recorded_at),
    }));
    return res.json({ success: true, data });
  } catch (err) {
    if (dbUnavailable(res, err)) return;
    console.error('[mood/activity-feedback/recent]', err);
    return res.status(500).json({ success: false, error: { message: 'Failed to load feedback.' } });
  }
});

export default router;
