import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticate, AuthRequest, requireUser } from '../middleware/auth';
import { UserActivity, UserActivityKind } from '../models/UserActivity';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { generateSimplePdf } from '../utils/simplePdf';

export const usersActivitiesRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/users/activities?kind=achievement
 */
usersActivitiesRouter.get(
  '/activities',
  authenticate,
  requireUser,
  [query('kind').optional().isString().trim()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const kind = (req.query.kind as string | undefined)?.trim();
    const filter: any = { userId: req.userId };
    if (kind) filter.kind = kind;

    const items = await UserActivity.find(filter)
      .sort({ startDate: -1, createdAt: -1 })
      .limit(500)
      .lean();

    res.json({ success: true, data: { items } });
    return;
  }
);

/**
 * POST /api/v1/users/activities
 */
usersActivitiesRouter.post(
  '/activities',
  authenticate,
  requireUser,
  [
    body('kind').isIn(['program', 'event', 'service', 'seva', 'achievement', 'note']),
    body('title').isString().trim().notEmpty(),
    body('org').optional().isString().trim(),
    body('department').optional().isString().trim(),
    body('location').optional().isString().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('hours').optional().isFloat({ min: 0 }),
    body('description').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const payload = req.body as {
      kind: UserActivityKind;
      title: string;
      org?: string;
      department?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      hours?: number;
      description?: string;
    };

    const item = await UserActivity.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      kind: payload.kind,
      title: payload.title,
      org: payload.org,
      department: payload.department,
      location: payload.location,
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
      hours: payload.hours,
      description: payload.description,
    });

    res.status(201).json({ success: true, data: { item } });
    return;
  }
);

/**
 * PUT /api/v1/users/activities/:id
 */
usersActivitiesRouter.put(
  '/activities/:id',
  authenticate,
  requireUser,
  [
    param('id').isString().trim().notEmpty(),
    body('kind').optional().isIn(['program', 'event', 'service', 'seva', 'achievement', 'note']),
    body('title').optional().isString().trim().notEmpty(),
    body('org').optional().isString().trim(),
    body('department').optional().isString().trim(),
    body('location').optional().isString().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('hours').optional().isFloat({ min: 0 }),
    body('description').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const { id } = req.params;

    const item = await UserActivity.findOne({ _id: id, userId: req.userId });
    if (!item) {
      res.status(404).json({ success: false, error: { message: 'Activity not found' } });
      return;
    }

    const patch = req.body as any;
    if (patch.kind !== undefined) item.kind = patch.kind;
    if (patch.title !== undefined) item.title = patch.title;
    if (patch.org !== undefined) item.org = patch.org;
    if (patch.department !== undefined) item.department = patch.department;
    if (patch.location !== undefined) item.location = patch.location;
    if (patch.startDate !== undefined) item.startDate = patch.startDate ? new Date(patch.startDate) : undefined;
    if (patch.endDate !== undefined) item.endDate = patch.endDate ? new Date(patch.endDate) : undefined;
    if (patch.hours !== undefined) item.hours = patch.hours;
    if (patch.description !== undefined) item.description = patch.description;

    await item.save();
    res.json({ success: true, data: { item } });
    return;
  }
);

/**
 * DELETE /api/v1/users/activities/:id
 */
usersActivitiesRouter.delete(
  '/activities/:id',
  authenticate,
  requireUser,
  [param('id').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const { id } = req.params;
    const deleted = await UserActivity.findOneAndDelete({ _id: id, userId: req.userId }).lean();
    if (!deleted) {
      res.status(404).json({ success: false, error: { message: 'Activity not found' } });
      return;
    }
    res.json({ success: true });
    return;
  }
);

/**
 * GET /api/v1/users/resume.pdf
 *
 * Generates a professional-ish PDF using profile + activities.
 */
usersActivitiesRouter.get('/resume.pdf', authenticate, requireUser, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select('-password').lean();
  if (!user) {
    res.status(404).json({ success: false, error: { message: 'User not found' } });
    return;
  }

  const details = await UserProfile.findOne({ userId: user._id }).lean();
  const activities = await UserActivity.find({ userId: user._id })
    .sort({ startDate: -1, createdAt: -1 })
    .limit(500)
    .lean();

  const headerLines: string[] = [];
  headerLines.push(`${user.name}`);
  headerLines.push(`Email: ${user.email}${user.phone ? ` | Phone: ${user.phone}` : ''}`);
  if (details?.city || details?.state || details?.country) {
    headerLines.push(
      `Location: ${(details.city || '').trim()}${details.state ? `, ${details.state}` : ''}${
        details.country ? `, ${details.country}` : ''
      }`.replace(/^Location:\s*,\s*/g, 'Location: ')
    );
  }
  if (details?.education) headerLines.push(`Education: ${details.education}`);
  if (details?.skills) headerLines.push(`Skills: ${details.skills}`);
  if (details?.availableFrom) headerLines.push(`Available from: ${new Date(details.availableFrom).toDateString()}`);
  if (details?.duration) headerLines.push(`Duration: ${details.duration}`);

  const group = (k: UserActivityKind) => activities.filter((a) => a.kind === k);
  const achievements = group('achievement');
  const seva = group('seva');
  const programs = group('program');
  const events = group('event');
  const services = group('service');
  const notes = group('note');

  const lines: string[] = [];
  lines.push(...headerLines);
  lines.push('');

  const section = (title: string, items: any[]) => {
    if (!items.length) return;
    lines.push(title);
    for (const it of items) {
      const dates =
        it.startDate || it.endDate
          ? ` (${it.startDate ? new Date(it.startDate).toISOString().slice(0, 10) : ''}${
              it.endDate ? ` to ${new Date(it.endDate).toISOString().slice(0, 10)}` : ''
            })`.replace('(  to ', '(')
          : '';
      const metaBits = [
        it.org ? `${it.org}` : null,
        it.department ? `${it.department}` : null,
        it.location ? `${it.location}` : null,
        typeof it.hours === 'number' ? `${it.hours}h` : null,
      ].filter(Boolean);
      const meta = metaBits.length ? ` — ${metaBits.join(' | ')}` : '';
      lines.push(`- ${it.title}${dates}${meta}`);
      if (it.description) lines.push(`  ${it.description}`);
    }
    lines.push('');
  };

  section('Achievements', achievements);
  section('Seva / Volunteering', seva);
  section('Programs', programs);
  section('Events', events);
  section('Services / Work', services);
  section('Notes', notes);

  const pdf = generateSimplePdf({
    title: 'Resume',
    author: user.name,
    lines,
  });

  const safeName = user.name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'resume';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
  res.send(pdf);
  return;
});

