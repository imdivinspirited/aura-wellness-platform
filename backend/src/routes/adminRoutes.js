import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db.js';
import { authenticate, requireAuth } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireRoles.js';
import { requireTwoFaInProdForAdmins } from '../middleware/requireTwoFaInProdForAdmins.js';

const router = Router();
router.use(authenticate);
router.use(requireAuth);
router.use(requireAdmin);
router.use(requireTwoFaInProdForAdmins);

function mapProgram(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description,
    description: r.description,
    category: r.category,
  };
}

function mapEvent(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description,
    description: r.description,
    schedule: r.schedule || {},
  };
}

function mapService(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description,
    description: r.description,
    category: r.category,
  };
}

function mapPage(r) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    status: r.status,
    language: r.language,
    sections: r.sections || [],
  };
}

function mapMedia(r) {
  return {
    id: r.id,
    kind: r.kind,
    contentType: r.content_type,
    fileName: r.file_name,
    sizeBytes: r.size_bytes,
    cdnUrl: r.cdn_url,
    alt: r.alt,
    title: r.title,
  };
}

router.get('/programs', async (_req, res) => {
  const db = getDb();
  const rows = await db
    .collection('cms_programs')
    .find({})
    .sort({ created_at: -1 })
    .toArray();
  res.json({ success: true, data: { programs: rows.map(mapProgram) } });
});

router.post('/programs', async (req, res) => {
  const b = req.body;
  const id = randomUUID();
  const now = new Date();
  const doc = {
    id,
    slug: b.slug,
    title: b.title,
    short_description: b.shortDescription || '',
    description: b.description || '',
    category: b.category || 'beginning',
    created_at: now,
    updated_at: now,
  };
  await getDb().collection('cms_programs').insertOne(doc);
  res.json({ success: true, data: { program: mapProgram(doc) } });
});

router.put('/programs/:id', async (req, res) => {
  const b = req.body;
  const db = getDb();
  const up = await db.collection('cms_programs').updateOne(
    { id: req.params.id },
    {
      $set: {
        slug: b.slug,
        title: b.title,
        short_description: b.shortDescription,
        description: b.description,
        category: b.category,
        updated_at: new Date(),
      },
    }
  );
  if (up.matchedCount === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const row = await db.collection('cms_programs').findOne({ id: req.params.id });
  res.json({ success: true, data: { program: mapProgram(row) } });
});

router.delete('/programs/:id', async (req, res) => {
  await getDb().collection('cms_programs').deleteOne({ id: req.params.id });
  res.json({ success: true });
});

router.get('/events', async (_req, res) => {
  const rows = await getDb()
    .collection('cms_events')
    .find({})
    .sort({ created_at: -1 })
    .toArray();
  res.json({ success: true, data: { events: rows.map(mapEvent) } });
});

router.post('/events', async (req, res) => {
  const b = req.body;
  const id = randomUUID();
  const now = new Date();
  const doc = {
    id,
    slug: b.slug,
    title: b.title,
    short_description: b.shortDescription || '',
    description: b.description || '',
    schedule: b.schedule || {},
    created_at: now,
    updated_at: now,
  };
  await getDb().collection('cms_events').insertOne(doc);
  res.json({ success: true, data: { event: mapEvent(doc) } });
});

router.put('/events/:id', async (req, res) => {
  const b = req.body;
  const db = getDb();
  const up = await db.collection('cms_events').updateOne(
    { id: req.params.id },
    {
      $set: {
        slug: b.slug,
        title: b.title,
        short_description: b.shortDescription,
        description: b.description,
        schedule: b.schedule || {},
        updated_at: new Date(),
      },
    }
  );
  if (up.matchedCount === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const row = await db.collection('cms_events').findOne({ id: req.params.id });
  res.json({ success: true, data: { event: mapEvent(row) } });
});

router.delete('/events/:id', async (req, res) => {
  await getDb().collection('cms_events').deleteOne({ id: req.params.id });
  res.json({ success: true });
});

router.get('/services', async (_req, res) => {
  const rows = await getDb()
    .collection('cms_services')
    .find({})
    .sort({ created_at: -1 })
    .toArray();
  res.json({ success: true, data: { services: rows.map(mapService) } });
});

router.post('/services', async (req, res) => {
  const b = req.body;
  const id = randomUUID();
  const now = new Date();
  const doc = {
    id,
    slug: b.slug,
    title: b.title,
    short_description: b.shortDescription || '',
    description: b.description || '',
    category: b.category || 'other',
    created_at: now,
    updated_at: now,
  };
  await getDb().collection('cms_services').insertOne(doc);
  res.json({ success: true, data: { service: mapService(doc) } });
});

router.put('/services/:id', async (req, res) => {
  const b = req.body;
  const db = getDb();
  const up = await db.collection('cms_services').updateOne(
    { id: req.params.id },
    {
      $set: {
        slug: b.slug,
        title: b.title,
        short_description: b.shortDescription,
        description: b.description,
        category: b.category,
        updated_at: new Date(),
      },
    }
  );
  if (up.matchedCount === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const row = await db.collection('cms_services').findOne({ id: req.params.id });
  res.json({ success: true, data: { service: mapService(row) } });
});

router.delete('/services/:id', async (req, res) => {
  await getDb().collection('cms_services').deleteOne({ id: req.params.id });
  res.json({ success: true });
});

router.get('/pages', async (_req, res) => {
  const rows = await getDb()
    .collection('cms_pages')
    .find({})
    .sort({ updated_at: -1 })
    .toArray();
  res.json({ success: true, data: { pages: rows.map(mapPage) } });
});

router.get('/pages/:id', async (req, res) => {
  const row = await getDb().collection('cms_pages').findOne({ id: req.params.id });
  if (!row) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  res.json({ success: true, data: { page: mapPage(row) } });
});

router.post('/pages', async (req, res) => {
  const b = req.body;
  const id = randomUUID();
  const now = new Date();
  const doc = {
    id,
    slug: b.slug,
    title: b.title,
    description: b.description || '',
    status: b.status || 'draft',
    language: b.language || 'en',
    sections: b.sections || [],
    created_at: now,
    updated_at: now,
  };
  await getDb().collection('cms_pages').insertOne(doc);
  res.json({ success: true, data: { page: mapPage(doc) } });
});

router.put('/pages/:id', async (req, res) => {
  const b = req.body;
  const db = getDb();
  const up = await db.collection('cms_pages').updateOne(
    { id: req.params.id },
    {
      $set: {
        slug: b.slug,
        title: b.title,
        description: b.description,
        status: b.status,
        language: b.language,
        sections: b.sections || [],
        updated_at: new Date(),
      },
    }
  );
  if (up.matchedCount === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });
  const row = await db.collection('cms_pages').findOne({ id: req.params.id });
  res.json({ success: true, data: { page: mapPage(row) } });
});

router.delete('/pages/:id', async (req, res) => {
  await getDb().collection('cms_pages').deleteOne({ id: req.params.id });
  res.json({ success: true });
});

router.get('/media', async (_req, res) => {
  const rows = await getDb().collection('cms_media_assets').find({}).sort({ created_at: -1 }).toArray();
  res.json({ success: true, data: { media: rows.map(mapMedia) } });
});

router.post('/media/presign', async (req, res) => {
  const b = req.body;
  const id = randomUUID();
  const host = req.get('host');
  const uploadUrl = `${req.protocol}://${host}/api/v1/admin/media/raw/${id}`;
  await getDb().collection('cms_media_assets').insertOne({
    id,
    kind: b.kind || 'image',
    content_type: b.contentType || 'application/octet-stream',
    file_name: b.fileName || 'file',
    size_bytes: b.sizeBytes || 0,
    cdn_url: null,
    created_at: new Date(),
  });
  res.json({ success: true, data: { uploadUrl, assetId: id } });
});

router.post('/media/finalize', async (req, res) => {
  const b = req.body;
  await getDb()
    .collection('cms_media_assets')
    .updateOne(
      { id: b.assetId },
      {
        $set: {
          alt: b.alt || null,
          title: b.title || null,
          ...(b.cdnUrl ? { cdn_url: b.cdnUrl } : {}),
        },
      }
    );
  res.json({ success: true });
});

router.post('/seed/demo', async (_req, res) => {
  const db = getDb();
  const exists = await db.collection('cms_programs').findOne({ slug: 'demo-happiness' });
  if (!exists) {
    const now = new Date();
    await db.collection('cms_programs').insertOne({
      id: randomUUID(),
      slug: 'demo-happiness',
      title: 'Happiness Program (demo)',
      short_description: 'Demo entry',
      description: 'Seeded for admin UI.',
      category: 'beginning',
      created_at: now,
      updated_at: now,
    });
  }
  res.json({ success: true, data: { indexedChunks: 0 } });
});

router.post('/search/reindex', async (_req, res) => {
  res.json({ success: true, data: { indexedChunks: 0 } });
});

router.get('/stats/overview', async (_req, res) => {
  const db = getDb();
  const totalUsers = await db.collection('users').countDocuments({ deleted_at: null });
  const activeUsers = await db.collection('users').countDocuments({ status: 'active', deleted_at: null });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const newToday = await db.collection('users').countDocuments({
    deleted_at: null,
    created_at: { $gte: startOfDay },
  });
  const dayAgo = new Date(Date.now() - 86400000);
  const failedLogins24h = await db.collection('login_attempts').countDocuments({
    success: false,
    created_at: { $gte: dayAgo },
  });
  const moodTotal = await db.collection('mood_entries').countDocuments({});
  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      newToday,
      failedLogins24h,
      moodTotal,
    },
  });
});

/** Mood analytics for admin dashboard (replaces Supabase `mood_entries` query). */
router.get('/mood-stats', async (_req, res) => {
  const db = getDb();
  const entries = await db
    .collection('mood_entries')
    .find({})
    .sort({ recorded_at: -1 })
    .limit(1000)
    .toArray();
  const data = entries.map((e) => ({
    mood: e.mood,
    recorded_at: e.recorded_at instanceof Date ? e.recorded_at.toISOString() : e.recorded_at,
  }));
  res.json({ success: true, data: { entries: data } });
});

export default router;
