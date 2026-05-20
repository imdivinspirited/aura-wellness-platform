/**
 * Forms Routes (Seva & Careers)
 *
 * - Presigned uploads for resume/photo
 * - Submission validation & persistence
 * - Best-effort Google Sheets sync
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireAuth, requireRole } from '../middleware/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from '../services/s3';
import { Counter } from '../models/Counter';
import { FormSubmission } from '../models/FormSubmission';
import { appendToSheets } from '../services/sheets';

export const formsRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

async function nextSerial(formType: 'seva' | 'career'): Promise<number> {
  const key = `form:${formType}:serial`;
  const updated = await Counter.findOneAndUpdate({ key }, { $inc: { value: 1 } }, { upsert: true, new: true });
  return updated.value;
}

/**
 * POST /api/v1/forms/presign
 * Presign upload for resume/photo.
 */
formsRouter.post(
  '/presign',
  authenticate,
  requireAuth,
  [
    body('kind').isIn(['resume', 'photo']),
    body('contentType').isString().trim().notEmpty(),
    body('fileName').isString().trim().notEmpty(),
    body('sizeBytes').isInt({ min: 1, max: 5_000_000 }),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      return res.status(503).json({ success: false, error: { message: 'S3 not configured: AWS_S3_BUCKET missing' } });
    }

    const { kind, contentType, fileName, sizeBytes } = req.body as {
      kind: 'resume' | 'photo';
      contentType: string;
      fileName: string;
      sizeBytes: number;
    };

    // Enforce stricter limits by type
    if (kind === 'resume') {
      if (contentType !== 'application/pdf') {
        return res.status(400).json({ success: false, error: { message: 'Resume must be PDF' } });
      }
      if (sizeBytes > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: { message: 'Resume must be <= 5MB' } });
      }
    } else {
      if (!['image/jpeg', 'image/png'].includes(contentType)) {
        return res.status(400).json({ success: false, error: { message: 'Photo must be JPG/PNG' } });
      }
      if (sizeBytes > 2 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: { message: 'Photo must be <= 2MB' } });
      }
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
    const key = `forms/${kind}/${Date.now()}_${safeName}`;

    const s3 = getS3Client();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
    });
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });

    const cfBase = process.env.CLOUDFRONT_MEDIA_BASE_URL?.replace(/\/$/, '');
    const cdnUrl = cfBase ? `${cfBase}/${key}` : undefined;

    res.json({
      success: true,
      data: {
        bucket,
        key,
        uploadUrl,
        url: cdnUrl || key,
      },
    });
    return;
  }
);

/**
 * POST /api/v1/forms/submit
 * Stores submission and attempts Sheets sync.
 */
formsRouter.post(
  '/submit',
  authenticate,
  requireAuth,
  [
    body('formType').isIn(['seva', 'career']),
    body('fullName').isString().trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').isString().trim().notEmpty().isLength({ min: 10, max: 20 }),
    body('whatsapp').optional().isString().trim(),
    body('type').optional().isString().trim(),
    body('position').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('age').optional().isInt({ min: 0, max: 120 }),
    body('gender').optional().isString().trim(),
    body('city').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('state').optional().isString().trim(),
    body('country').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('education').optional().isString().trim(),
    body('skills').optional().isString().trim(),
    body('availableFrom').optional().isISO8601(),
    body('duration').optional().isString().trim(),
    body('whyJoin').optional().isString().trim().isLength({ min: 10, max: 2000 }),
    body('files').optional().isArray(),
    body('files.*.kind').optional().isIn(['resume', 'photo']),
    body('files.*.url').optional().isString().trim().notEmpty(),
    body('files.*.originalName').optional().isString().trim(),
    body('files.*.contentType').optional().isString().trim(),
    body('files.*.sizeBytes').optional().isInt({ min: 1 }),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const formType = req.body.formType as 'seva' | 'career';
    const serialNumber = await nextSerial(formType);
    const heading = `${formType.toUpperCase()}-${String(serialNumber).padStart(6, '0')}`;

    const created = await FormSubmission.create({
      formType,
      serialNumber,
      heading,
      userId: req.userId,
      anonymousId: req.anonymousId,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      type: req.body.type,
      position: req.body.position,
      age: req.body.age,
      gender: req.body.gender,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      education: req.body.education,
      skills: req.body.skills,
      availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : undefined,
      duration: req.body.duration,
      whyJoin: req.body.whyJoin,
      files: Array.isArray(req.body.files) ? req.body.files : [],
    });

    // Best-effort sheets sync (non-blocking for success)
    (async () => {
      try {
        const resumeUrl = (created.files || []).find((f) => f.kind === 'resume')?.url || '';
        const photoUrl = (created.files || []).find((f) => f.kind === 'photo')?.url || '';
        const { rowIndex } = await appendToSheets({
          serialNumber: created.serialNumber,
          heading: created.heading,
          formType: created.formType,
          fullName: created.fullName,
          email: created.email,
          phone: created.phone,
          whatsapp: created.whatsapp || '',
          type: created.type || '',
          position: created.position || '',
          age: created.age ?? '',
          gender: created.gender || '',
          city: created.city || '',
          state: created.state || '',
          country: created.country || '',
          education: created.education || '',
          skills: created.skills || '',
          availableFrom: created.availableFrom ? created.availableFrom.toISOString().slice(0, 10) : '',
          duration: created.duration || '',
          whyJoin: created.whyJoin || '',
          resumeUrl,
          photoUrl,
          createdAt: created.createdAt.toISOString(),
        });
        created.syncedToSheetsAt = new Date();
        created.sheetsRowId = rowIndex ? String(rowIndex) : undefined;
        await created.save();
      } catch {
        // keep unsynced; admin can retry later
      }
    })().catch(() => undefined);

    res.status(201).json({
      success: true,
      data: {
        submission: {
          id: created._id.toString(),
          heading: created.heading,
          serialNumber: created.serialNumber,
          formType: created.formType,
          createdAt: created.createdAt,
        },
      },
    });
    return;
  }
);

/**
 * Admin: list submissions and retry sync
 */
formsRouter.get(
  '/submissions',
  authenticate,
  requireRole(['root', 'super_admin', 'hr', 'content_admin']),
  async (_req: AuthRequest, res: Response) => {
    const submissions = await FormSubmission.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, data: { submissions } });
    return;
  }
);

formsRouter.post(
  '/submissions/:id/retry-sync',
  authenticate,
  requireRole(['root', 'super_admin', 'hr', 'content_admin']),
  [body('force').optional().isBoolean()],
  async (req: AuthRequest, res: Response) => {
    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, error: { message: 'Submission not found' } });
    }
    try {
      const resumeUrl = (submission.files || []).find((f) => f.kind === 'resume')?.url || '';
      const photoUrl = (submission.files || []).find((f) => f.kind === 'photo')?.url || '';
      const { rowIndex } = await appendToSheets({
        serialNumber: submission.serialNumber,
        heading: submission.heading,
        formType: submission.formType,
        fullName: submission.fullName,
        email: submission.email,
        phone: submission.phone,
        whatsapp: submission.whatsapp || '',
        type: submission.type || '',
        position: submission.position || '',
        age: submission.age ?? '',
        gender: submission.gender || '',
        city: submission.city || '',
        state: submission.state || '',
        country: submission.country || '',
        education: submission.education || '',
        skills: submission.skills || '',
        availableFrom: submission.availableFrom ? submission.availableFrom.toISOString().slice(0, 10) : '',
        duration: submission.duration || '',
        whyJoin: submission.whyJoin || '',
        resumeUrl,
        photoUrl,
        createdAt: submission.createdAt.toISOString(),
      });
      submission.syncedToSheetsAt = new Date();
      submission.sheetsRowId = rowIndex ? String(rowIndex) : submission.sheetsRowId;
      await submission.save();
      res.json({ success: true, data: { syncedToSheetsAt: submission.syncedToSheetsAt, sheetsRowId: submission.sheetsRowId } });
      return;
    } catch (e) {
      res.status(503).json({ success: false, error: { message: e instanceof Error ? e.message : 'Sync failed' } });
      return;
    }
  }
);

