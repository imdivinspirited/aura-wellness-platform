import { Router, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireAuth } from '../middleware/auth';
import { MoodEntry, MoodValue } from '../models/MoodEntry';

export const moodRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/mood/recent?limit=30
 */
moodRouter.get(
  '/mood/recent',
  authenticate,
  requireAuth,
  [query('limit').optional().isInt({ min: 1, max: 200 })],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const filter = req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId };
    const items = await MoodEntry.find(filter).sort({ at: -1 }).limit(limit).lean();
    res.json({ success: true, data: { items } });
    return;
  }
);

/**
 * POST /api/v1/mood
 */
moodRouter.post(
  '/mood',
  authenticate,
  requireAuth,
  [body('mood').isIn(['great', 'good', 'okay', 'stressed', 'anxious', 'sad', 'angry', 'tired']), body('note').optional().isString().trim()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const { mood, note } = req.body as { mood: MoodValue; note?: string };
    const doc = await MoodEntry.create({
      userId: req.userId || undefined,
      anonymousId: req.userId ? undefined : req.anonymousId,
      mood,
      note: note || undefined,
      at: new Date(),
    });
    res.status(201).json({ success: true, data: { item: doc } });
    return;
  }
);

/**
 * GET /api/v1/mood/summary?days=30
 */
moodRouter.get(
  '/mood/summary',
  authenticate,
  requireAuth,
  [query('days').optional().isInt({ min: 1, max: 365 })],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const days = req.query.days ? Number(req.query.days) : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const filter = req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId };

    const items = await MoodEntry.find({ ...filter, at: { $gte: since } }).select('mood at').lean();
    const counts: Record<string, number> = {};
    for (const it of items) counts[it.mood] = (counts[it.mood] || 0) + 1;

    const latest = await MoodEntry.findOne(filter).sort({ at: -1 }).lean();
    res.json({ success: true, data: { days, total: items.length, counts, latest } });
    return;
  }
);

