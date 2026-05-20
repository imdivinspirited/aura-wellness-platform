import { Router, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { Program } from '../models/Program';
import { Event } from '../models/Event';

export const internationalRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/international/overview?lang=en
 *
 * Returns international-visible programs and upcoming published events.
 * Timezone conversion is done on the client using Intl APIs for accuracy.
 */
internationalRouter.get(
  '/international/overview',
  [query('lang').optional().isString().trim()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const lang = String(req.query.lang || 'en').trim() || 'en';
    const now = new Date();

    const [programs, events] = await Promise.all([
      Program.find({ isInternationalVisible: true, languages: { $in: [lang] } })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
      Event.find({
        isInternationalVisible: true,
        isPublished: true,
        'schedule.startAt': { $gte: now },
        languages: { $in: [lang] },
      })
        .sort({ 'schedule.startAt': 1 })
        .limit(200)
        .lean(),
    ]);

    res.json({ success: true, data: { programs, events, serverTime: now.toISOString() } });
    return;
  }
);

