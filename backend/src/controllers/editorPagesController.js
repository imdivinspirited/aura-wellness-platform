import { z } from 'zod';
import { PageModel } from '../models/Page.js';
import { EditHistoryModel } from '../models/EditHistory.js';
import { normalizeBlocksArray } from '../lib/editorBlockNormalize.js';

/** Safe URL segment for page slugs (e.g. `home`, `about-us`). */
const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,127}$/;

function assertValidSlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug);
}

function formatZodIssues(err) {
  return err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
}

const saveSchema = z.object({
  pageUrl: z.preprocess((v) => (v === null || v === undefined ? undefined : String(v)), z.string().optional()),
  title: z.preprocess((v) => (v === null || v === undefined ? undefined : String(v)), z.string().optional()),
  components: z.array(z.any()).optional(),
  blocks: z.array(z.any()).optional(),
  description: z.string().max(500).optional(),
});

const patchOpSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('deleteBlock'),
    id: z.string().min(1),
  }),
  z.object({
    operation: z.literal('updateBlock'),
    id: z.string().min(1),
    content: z.record(z.any()).optional(),
    type: z.string().optional(),
  }),
  z.object({
    operation: z.literal('reorder'),
    blockIds: z.array(z.string()),
  }),
]);

function defaultTitleForSlug(slug) {
  if (slug === 'home') return 'Home Page';
  return String(slug)
    .split(/[-_/]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Full page payload for the SPA (blocks are always canonical `{ id, type, content }`).
 */
export function toEditorPageShape(doc) {
  if (!doc) return null;
  const blocks = normalizeBlocksArray(doc.blocks);
  return {
    slug: doc.slug,
    title: doc.title ?? '',
    blocks,
    pageId: doc.slug,
    pageUrl: doc.pageUrl ?? '/',
    components: blocks,
    version: doc.version ?? 0,
    lastEditedBy: doc.lastEditedBy ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function persistPage(slug, blocks, editorId, extra, description) {
  const existing = await PageModel.findOne({ slug }).lean();
  const nextVersion = (existing?.version ?? 0) + 1;

  const $set = {
    slug,
    blocks,
    version: nextVersion,
    lastEditedBy: editorId,
  };
  if (extra.pageUrl !== undefined) $set.pageUrl = extra.pageUrl;
  if (extra.title !== undefined) $set.title = extra.title;

  const page = await PageModel.findOneAndUpdate(
    { slug },
    { $set, $setOnInsert: { title: defaultTitleForSlug(slug) } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  try {
    await EditHistoryModel.create({
      pageId: slug,
      version: nextVersion,
      changes: [],
      snapshot: page,
      editedBy: editorId,
      editedAt: new Date(),
      description: description || `Saved v${nextVersion}`,
    });
  } catch (histErr) {
    console.error('[editorPagesController/persistPage] EditHistory insert failed (page still saved):', histErr?.message || histErr);
  }

  return page;
}

/**
 * GET /api/v1/editor/pages/:slug
 */
export async function getEditorPage(req, res) {
  const slug = req.params.slug;
  if (!assertValidSlug(slug)) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid slug.' },
    });
  }

  try {
    let doc = await PageModel.findOne({ slug }).lean();

    if (!doc) {
      try {
        const created = await PageModel.create({
          slug,
          title: defaultTitleForSlug(slug),
          pageUrl: '/',
          blocks: [],
          version: 0,
          lastEditedBy: req.rootUser?.id ?? null,
        });
        doc = created.toObject();
      } catch (e) {
        if (e && e.code === 11000) {
          doc = await PageModel.findOne({ slug }).lean();
        } else {
          throw e;
        }
      }
    }

    if (!doc) {
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL', message: 'Could not load or create page.' },
      });
    }

    const page = toEditorPageShape(doc);
    const blocks = page.blocks;

    return res.json({
      success: true,
      data: {
        slug: page.slug,
        blocks,
        page,
      },
    });
  } catch (e) {
    console.error('[editorPagesController/getEditorPage]', e);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to load page.' },
    });
  }
}

/**
 * PUT / POST — full replace of blocks (and optional title/pageUrl).
 */
export async function saveEditorPage(req, res) {
  const slug = req.params.slug;
  if (!assertValidSlug(slug)) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid slug.' },
    });
  }
  const parsed = saveSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: formatZodIssues(parsed.error) },
    });
  }

  const rawBlocks = parsed.data.blocks ?? parsed.data.components ?? [];
  const blocks = normalizeBlocksArray(rawBlocks);
  const editorId = req.rootUser?.id ?? null;

  try {
    const page = await persistPage(
      slug,
      blocks,
      editorId,
      { pageUrl: parsed.data.pageUrl, title: parsed.data.title },
      parsed.data.description
    );
    const shaped = toEditorPageShape(page);
    return res.json({
      success: true,
      data: {
        slug: shaped.slug,
        blocks: shaped.blocks,
        page: shaped,
      },
    });
  } catch (e) {
    console.error('[editorPagesController/saveEditorPage]', e);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to save page.' },
    });
  }
}

/**
 * PATCH — delete / update one block / reorder without sending full document.
 */
export async function patchEditorPage(req, res) {
  const slug = req.params.slug;
  if (!assertValidSlug(slug)) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid slug.' },
    });
  }
  const parsed = patchOpSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: formatZodIssues(parsed.error) },
    });
  }

  const editorId = req.rootUser?.id ?? null;

  try {
    let doc = await PageModel.findOne({ slug }).lean();
    if (!doc) {
      await PageModel.create({
        slug,
        title: defaultTitleForSlug(slug),
        pageUrl: '/',
        blocks: [],
        version: 0,
        lastEditedBy: editorId,
      });
      doc = await PageModel.findOne({ slug }).lean();
    }

    let blocks = normalizeBlocksArray(doc.blocks);
    const op = parsed.data;

    if (op.operation === 'deleteBlock') {
      blocks = blocks.filter((b) => b.id !== op.id);
    } else if (op.operation === 'updateBlock') {
      blocks = blocks.map((b) => {
        if (b.id !== op.id) return b;
        const next = {
          ...b,
          content: { ...b.content, ...(op.content || {}) },
        };
        if (op.type !== undefined && op.type !== '') {
          next.type = op.type;
        }
        return next;
      });
    } else if (op.operation === 'reorder') {
      const map = new Map(blocks.map((b) => [b.id, b]));
      const ordered = [];
      const seen = new Set();
      for (const id of op.blockIds) {
        const b = map.get(id);
        if (b) {
          ordered.push(b);
          seen.add(id);
        }
      }
      for (const b of blocks) {
        if (!seen.has(b.id)) ordered.push(b);
      }
      blocks = ordered;
    }

    const page = await persistPage(slug, blocks, editorId, {}, `PATCH ${op.operation}`);
    const shaped = toEditorPageShape(page);
    return res.json({
      success: true,
      data: {
        slug: shaped.slug,
        blocks: shaped.blocks,
        page: shaped,
      },
    });
  } catch (e) {
    console.error('[editorPagesController/patchEditorPage]', e);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to patch page.' },
    });
  }
}

/**
 * GET /api/v1/editor/pages/:slug/history
 */
export async function getEditorHistory(req, res) {
  const slug = req.params.slug;
  if (!assertValidSlug(slug)) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid slug.' },
    });
  }
  try {
    const rows = await EditHistoryModel.find({ pageId: slug })
      .sort({ version: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, data: { versions: rows } });
  } catch (e) {
    console.error('[editorPagesController/getEditorHistory]', e);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to load history.' },
    });
  }
}
