/**
 * Admin Routes
 *
 * Provides role-restricted CRUD endpoints for CMS entities.
 * This is the foundation for the admin panel.
 */

import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Program } from '../models/Program';
import { Event } from '../models/Event';
import { Service } from '../models/Service';
import { Page } from '../models/Page';
import { MediaAsset } from '../models/MediaAsset';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from '../services/s3';
import { Page as CmsPageModel } from '../models/Page';
import { rebuildSearchIndexFromDocs } from './chatbot';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';

export const adminRouter = Router();

// All admin routes require authenticated users with an admin-capable role.
adminRouter.use(authenticate);
adminRouter.use(requireRole(['root', 'admin', 'super_admin', 'hr', 'service', 'shop', 'finance', 'content_admin']));

function handleValidation(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: { message: 'Validation failed', errors: errors.array() },
    });
    return false;
  }
  return true;
}

/**
 * Rebuild chatbot search index (Content admins)
 * POST /api/v1/admin/search/reindex
 */
adminRouter.post(
  '/search/reindex',
  requireRole(['root', 'super_admin', 'content_admin']),
  async (_req: AuthRequest, res: Response) => {
    // Note: this may take time depending on content size.
    const [pages, programs, events, services] = await Promise.all([
      CmsPageModel.find({ status: 'published' }).lean(),
      Program.find({}).lean(),
      Event.find({ isPublished: true }).lean(),
      Service.find({}).lean(),
    ]);

    const docs: Array<{ docType: string; docId: string; title: string; url: string; language: string; text: string }> = [];

    for (const p of pages) {
      const sectionText = (p.sections || [])
        .map((s: any) => {
          const props = s?.props || {};
          const pieces: string[] = [];
          for (const k of Object.keys(props)) {
            const v = (props as any)[k];
            if (typeof v === 'string') pieces.push(v);
          }
          return pieces.join(' ');
        })
        .join('\n');

      docs.push({
        docType: 'page',
        docId: String(p._id),
        title: p.title,
        url: `/p/${p.slug}`,
        language: p.language || 'en',
        text: [p.title, p.description, sectionText].filter(Boolean).join('\n\n'),
      });
    }

    for (const pr of programs) {
      docs.push({
        docType: 'program',
        docId: String(pr._id),
        title: pr.title,
        url: `/programs/${pr.slug}`,
        language: (pr.languages && pr.languages[0]) || 'en',
        text: [pr.title, pr.shortDescription, pr.description, (pr.tags || []).join(', ')].filter(Boolean).join('\n\n'),
      });
    }

    for (const ev of events) {
      docs.push({
        docType: 'event',
        docId: String(ev._id),
        title: ev.title,
        url: `/events/${ev.slug}`,
        language: (ev.languages && ev.languages[0]) || 'en',
        text: [
          ev.title,
          ev.shortDescription,
          ev.description,
          (ev.tags || []).join(', '),
          ev.location?.city ? `City: ${ev.location.city}` : '',
          ev.location?.country ? `Country: ${ev.location.country}` : '',
          ev.schedule?.startAt ? `Start: ${new Date(ev.schedule.startAt).toISOString()}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
    }

    for (const sv of services) {
      docs.push({
        docType: 'service',
        docId: String(sv._id),
        title: sv.title,
        url: `/services/${sv.slug}`,
        language: (sv.languages && sv.languages[0]) || 'en',
        text: [sv.title, sv.shortDescription, sv.description, (sv.tags || []).join(', ')].filter(Boolean).join('\n\n'),
      });
    }

    const result = await rebuildSearchIndexFromDocs(docs);
    res.json({ success: true, data: { indexedDocs: docs.length, indexedChunks: result.chunks } });
    return;
  }
);

/**
 * Seed demo data + rebuild chatbot index (Super Admin / Content Admin)
 * POST /api/v1/admin/seed/demo
 */
adminRouter.post(
  '/seed/demo',
  requireRole(['root', 'super_admin', 'content_admin']),
  async (_req: AuthRequest, res: Response) => {
    // Upsert a minimal, safe dataset for first-run validation.
    const shop = await Shop.findOneAndUpdate(
      { slug: 'aura-shop' },
      { $set: { slug: 'aura-shop', name: 'The AOLIC Shop', status: 'active', contact: {} }, $setOnInsert: { ownerUserIds: [] } },
      { upsert: true, new: true }
    );

    await Product.findOneAndUpdate(
      { shopId: shop._id, slug: 'ayurveda-oil' },
      {
        $set: {
          shopId: shop._id,
          slug: 'ayurveda-oil',
          name: 'Ayurveda Massage Oil',
          description: 'Traditional herbal oil for relaxation and recovery.',
          priceCents: 49900,
          currency: 'INR',
          stock: 50,
          images: [],
          tags: ['ayurveda', 'wellness'],
          isPublished: true,
        },
      },
      { upsert: true, new: true }
    );
    await Product.findOneAndUpdate(
      { shopId: shop._id, slug: 'meditation-beads' },
      {
        $set: {
          shopId: shop._id,
          slug: 'meditation-beads',
          name: 'Meditation Beads (Mala)',
          description: 'Handcrafted mala beads for meditation practice.',
          priceCents: 29900,
          currency: 'INR',
          stock: 100,
          images: [],
          tags: ['meditation', 'spiritual'],
          isPublished: true,
        },
      },
      { upsert: true, new: true }
    );

    await Program.findOneAndUpdate(
      { slug: 'international-happiness' },
      {
        $set: {
          slug: 'international-happiness',
          title: 'International Happiness Program',
          shortDescription: 'A beginner-friendly program for international visitors with flexible schedules.',
          description: 'Breathing techniques, meditation, and practical wisdom in a structured multi-day format.',
          category: 'beginning',
          tags: ['international', 'wellness'],
          audience: ['adults'],
          durationDays: 3,
          isOnline: true,
          baseTimezone: 'Asia/Kolkata',
          languages: ['en'],
          isInternationalVisible: true,
          galleryImageUrls: [],
          youtubeVideoIds: [],
          metadata: { difficulty: 'introductory', benefits: ['Stress relief', 'Better sleep'] },
        },
      },
      { upsert: true, new: true }
    );

    await Event.findOneAndUpdate(
      { slug: 'international-orientation' },
      {
        $set: {
          slug: 'international-orientation',
          title: 'International Visitor Orientation',
          shortDescription: 'Get started with campus guidance, schedules, and program recommendations.',
          description: 'Orientation session with Q&A and recommended next steps.',
          tags: ['international', 'live'],
          schedule: { startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), timezone: 'Asia/Kolkata' },
          galleryImageUrls: [],
          youtubeVideoIds: [],
          isPublished: true,
          isInternationalVisible: true,
          languages: ['en'],
        },
      },
      { upsert: true, new: true }
    );

    await Service.findOneAndUpdate(
      { slug: 'campus-shopping' },
      {
        $set: {
          slug: 'campus-shopping',
          title: 'Campus Shopping',
          shortDescription: 'Shop wellness, books, and spiritual items.',
          description: 'On-campus shopping including ayurveda products, books, and gifts.',
          category: 'shopping',
          tags: ['shop'],
          galleryImageUrls: [],
          youtubeVideoIds: [],
          isPublished: true,
          languages: ['en'],
        },
      },
      { upsert: true, new: true }
    );

    await Page.findOneAndUpdate(
      { slug: 'international-visitors' },
      {
        $set: {
          slug: 'international-visitors',
          title: 'International Visitors',
          description: 'Timezone-aware events, curated programs, and visitor guidance.',
          status: 'published',
          language: 'en',
          sections: [
            { sectionId: 'hero-1', type: 'hero', order: 1, props: { title: 'International Visitors', subtitle: 'Timezone-aware events and curated programs.' } },
            { sectionId: 'rt-1', type: 'rich_text', order: 2, props: { html: '<p>This page is seeded to verify real CMS + chatbot indexing.</p>' } },
          ],
        },
      },
      { upsert: true, new: true }
    );

    // Reindex after seed for immediate chatbot accuracy
    const [pages, programs, events, services] = await Promise.all([
      CmsPageModel.find({ status: 'published' }).lean(),
      Program.find({}).lean(),
      Event.find({ isPublished: true }).lean(),
      Service.find({}).lean(),
    ]);

    const docs: Array<{ docType: string; docId: string; title: string; url: string; language: string; text: string }> = [];
    for (const p of pages) {
      const sectionText = (p.sections || [])
        .map((s: any) => {
          const props = s?.props || {};
          const pieces: string[] = [];
          for (const k of Object.keys(props)) {
            const v = (props as any)[k];
            if (typeof v === 'string') pieces.push(v);
          }
          return pieces.join(' ');
        })
        .join('\n');
      docs.push({
        docType: 'page',
        docId: String(p._id),
        title: p.title,
        url: `/p/${p.slug}`,
        language: p.language || 'en',
        text: [p.title, p.description, sectionText].filter(Boolean).join('\n\n'),
      });
    }
    for (const pr of programs) {
      docs.push({
        docType: 'program',
        docId: String(pr._id),
        title: pr.title,
        url: `/programs/${pr.slug}`,
        language: (pr.languages && pr.languages[0]) || 'en',
        text: [pr.title, pr.shortDescription, pr.description, (pr.tags || []).join(', ')].filter(Boolean).join('\n\n'),
      });
    }
    for (const ev of events) {
      docs.push({
        docType: 'event',
        docId: String(ev._id),
        title: ev.title,
        url: `/events/${ev.slug}`,
        language: (ev.languages && ev.languages[0]) || 'en',
        text: [ev.title, ev.shortDescription, ev.description, (ev.tags || []).join(', ')].filter(Boolean).join('\n\n'),
      });
    }
    for (const sv of services) {
      docs.push({
        docType: 'service',
        docId: String(sv._id),
        title: sv.title,
        url: `/services/${sv.slug}`,
        language: (sv.languages && sv.languages[0]) || 'en',
        text: [sv.title, sv.shortDescription, sv.description, (sv.tags || []).join(', ')].filter(Boolean).join('\n\n'),
      });
    }

    const indexed = await rebuildSearchIndexFromDocs(docs);
    res.json({ success: true, data: { seeded: true, indexedDocs: docs.length, indexedChunks: indexed.chunks } });
    return;
  }
);

/**
 * Users & roles (Super Admin only)
 */
adminRouter.get(
  '/users',
  requireRole(['root', 'super_admin']),
  [query('search').optional().isString().trim()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const search = String(req.query.search || '').trim();
    const q = search
      ? {
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const users = await User.find(q).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: { users } });
    return;
  }
);

adminRouter.put(
  '/users/:id/roles',
  requireRole(['root', 'super_admin']),
  [param('id').isString().notEmpty(), body('roles').isArray({ min: 1 }), body('roles.*').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const roles = Array.from(new Set((req.body.roles as string[]).map((r) => r.trim()))).filter(Boolean);
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.json({ success: true, data: { user: updated } });
    return;
  }
);

/**
 * Programs CRUD (Content admins)
 */
adminRouter.get('/programs', requireRole(['root', 'super_admin', 'content_admin']), async (_req, res) => {
  const programs = await Program.find({}).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { programs } });
  return;
});

adminRouter.post(
  '/programs',
  requireRole(['root', 'super_admin', 'content_admin']),
  [
    body('slug').isString().trim().notEmpty(),
    body('title').isString().trim().notEmpty(),
    body('shortDescription').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('category').isIn(['beginning', 'advance', 'children_teens', 'more', 'retreats']),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const created = await Program.create(req.body);
    res.status(201).json({ success: true, data: { program: created } });
    return;
  }
);

adminRouter.put(
  '/programs/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Program not found' } });
    res.json({ success: true, data: { program: updated } });
    return;
  }
);

adminRouter.delete(
  '/programs/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const deleted = await Program.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Program not found' } });
    res.json({ success: true, data: { deleted: true } });
    return;
  }
);

/**
 * Events CRUD (Content admins)
 */
adminRouter.get('/events', requireRole(['root', 'super_admin', 'content_admin']), async (_req, res) => {
  const events = await Event.find({}).sort({ 'schedule.startAt': -1 }).lean();
  res.json({ success: true, data: { events } });
  return;
});

adminRouter.post(
  '/events',
  requireRole(['root', 'super_admin', 'content_admin']),
  [
    body('slug').isString().trim().notEmpty(),
    body('title').isString().trim().notEmpty(),
    body('shortDescription').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('schedule.startAt').isISO8601(),
    body('schedule.timezone').optional().isString().trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const created = await Event.create(req.body);
    res.status(201).json({ success: true, data: { event: created } });
    return;
  }
);

adminRouter.put(
  '/events/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    res.json({ success: true, data: { event: updated } });
    return;
  }
);

adminRouter.delete(
  '/events/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const deleted = await Event.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    res.json({ success: true, data: { deleted: true } });
    return;
  }
);

/**
 * Services CRUD (Service admins)
 */
adminRouter.get('/services', requireRole(['root', 'super_admin', 'service', 'content_admin']), async (_req, res) => {
  const services = await Service.find({}).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { services } });
  return;
});

adminRouter.post(
  '/services',
  requireRole(['root', 'super_admin', 'service', 'content_admin']),
  [
    body('slug').isString().trim().notEmpty(),
    body('title').isString().trim().notEmpty(),
    body('shortDescription').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('category').isIn(['dining', 'stay', 'transport', 'facilities', 'shopping', 'support', 'other']),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const created = await Service.create(req.body);
    res.status(201).json({ success: true, data: { service: created } });
    return;
  }
);

adminRouter.put(
  '/services/:id',
  requireRole(['root', 'super_admin', 'service', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Service not found' } });
    res.json({ success: true, data: { service: updated } });
    return;
  }
);

adminRouter.delete(
  '/services/:id',
  requireRole(['root', 'super_admin', 'service', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const deleted = await Service.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Service not found' } });
    res.json({ success: true, data: { deleted: true } });
    return;
  }
);

/**
 * Pages CRUD (Content admins)
 */
adminRouter.get('/pages', requireRole(['root', 'super_admin', 'content_admin']), async (_req, res) => {
  const pages = await Page.find({}).sort({ updatedAt: -1 }).lean();
  res.json({ success: true, data: { pages } });
  return;
});

adminRouter.get(
  '/pages/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const page = await Page.findById(req.params.id).lean();
    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }
    res.json({ success: true, data: { page } });
    return;
  }
);

adminRouter.post(
  '/pages',
  requireRole(['root', 'super_admin', 'content_admin']),
  [
    body('slug').isString().trim().notEmpty(),
    body('title').isString().trim().notEmpty(),
    body('status').optional().isIn(['draft', 'published']),
    body('language').optional().isString().trim().notEmpty(),
    body('sections').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const created = await Page.create(req.body);
    res.status(201).json({ success: true, data: { page: created } });
    return;
  }
);

adminRouter.put(
  '/pages/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const updated = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    res.json({ success: true, data: { page: updated } });
    return;
  }
);

adminRouter.delete(
  '/pages/:id',
  requireRole(['root', 'super_admin', 'content_admin']),
  [param('id').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const deleted = await Page.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    res.json({ success: true, data: { deleted: true } });
    return;
  }
);

/**
 * Media library
 */
adminRouter.get('/media', requireRole(['root', 'super_admin', 'content_admin']), async (_req, res) => {
  const media = await MediaAsset.find({}).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: { media } });
  return;
});

/**
 * POST /api/v1/admin/media/presign
 * Generate a presigned PUT URL for direct browser upload to S3.
 */
adminRouter.post(
  '/media/presign',
  requireRole(['root', 'super_admin', 'content_admin']),
  [
    body('kind').isIn(['image', 'document']),
    body('contentType').isString().trim().notEmpty(),
    body('fileName').isString().trim().notEmpty(),
    body('sizeBytes').isInt({ min: 1, max: 10_000_000 }),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;

    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      return res.status(503).json({ success: false, error: { message: 'S3 not configured: AWS_S3_BUCKET missing' } });
    }

    const { kind, contentType, fileName, sizeBytes } = req.body as {
      kind: 'image' | 'document';
      contentType: string;
      fileName: string;
      sizeBytes: number;
    };

    // Normalize a safe key (no path traversal); keep original name in DB.
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
    const key = `${kind}s/${Date.now()}_${safeName}`;

    const s3 = getS3Client();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'private',
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });

    // Create DB record immediately; client confirms completion via finalize endpoint.
    const asset = await MediaAsset.create({
      kind,
      contentType,
      sizeBytes,
      originalFileName: fileName,
      s3Bucket: bucket,
      s3Key: key,
      variants: [],
      tags: [],
    });

    res.json({
      success: true,
      data: {
        assetId: asset._id.toString(),
        bucket,
        key,
        uploadUrl,
      },
    });
    return;
  }
);

/**
 * POST /api/v1/admin/media/finalize
 * Mark a media asset as ready and attach a CDN URL (CloudFront).
 */
adminRouter.post(
  '/media/finalize',
  requireRole(['root', 'super_admin', 'content_admin']),
  [
    body('assetId').isString().trim().notEmpty(),
    body('cdnUrl').optional().isString().trim().notEmpty(),
    body('alt').optional().isString().trim(),
    body('title').optional().isString().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!handleValidation(req, res)) return;
    const { assetId, cdnUrl, alt, title } = req.body as {
      assetId: string;
      cdnUrl?: string;
      alt?: string;
      title?: string;
    };

    const asset = await MediaAsset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, error: { message: 'Asset not found' } });
    }

    const cfBase = process.env.CLOUDFRONT_MEDIA_BASE_URL?.replace(/\/$/, '');
    const computedCdnUrl = cdnUrl || (cfBase && asset.s3Key ? `${cfBase}/${asset.s3Key}` : undefined);

    if (title !== undefined) asset.title = title;
    if (alt !== undefined) asset.alt = alt;
    if (computedCdnUrl) asset.cdnUrl = computedCdnUrl;
    await asset.save();

    res.json({ success: true, data: { asset } });
    return;
  }
);

