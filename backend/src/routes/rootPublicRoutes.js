/**
 * Public root routes mounted under /api/v1/root (before rootAuthRoutes).
 * GET /overrides — published UI text patches (same collection as Mongoose RootOverride).
 */
import { Router } from 'express';
import { getDb } from '../db.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';

const router = Router();

/** Mongoose model "RootOverride" uses collection "rootoverrides" */
const COL = 'rootoverrides';

router.get('/overrides', async (req, res) => {
  const page = typeof req.query.page === 'string' ? req.query.page.trim() : '';
  if (!page) {
    return res.status(400).json({
      success: false,
      error: { message: 'Query parameter "page" is required.' },
    });
  }
  try {
    const db = getDb();
    const rows = await db
      .collection(COL)
      .find({ page })
      .sort({ updatedAt: -1 })
      .toArray();
    return res.json({
      success: true,
      data: {
        page,
        overrides: rows.map((o) => ({
          page: o.page,
          elementId: o.elementId,
          selector: o.selector,
          type: o.type ?? 'text',
          value: o.value,
          version: o.version ?? 1,
          updatedAt: o.updatedAt,
        })),
      },
    });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[root/overrides]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get overrides' },
    });
  }
});

export default router;
