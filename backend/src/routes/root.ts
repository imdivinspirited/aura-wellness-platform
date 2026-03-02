/**
 * Root Editor Routes
 *
 * Stores and serves published UI overrides (text patches for now).
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { query, body, validationResult } from 'express-validator';
import { RootOverride } from '../models/RootOverride';

export const rootRouter = Router();

/**
 * GET /api/v1/root/overrides?page=/some/path
 * Public-readable overrides for a page.
 */
rootRouter.get(
  '/overrides',
  authenticate,
  [query('page').isString().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const page = String(req.query.page);
      const overrides = await RootOverride.find({ page }).sort({ updatedAt: -1 }).lean();

      res.json({
        success: true,
        data: {
          page,
          overrides: overrides.map((o) => ({
            page: o.page,
            elementId: o.elementId,
            selector: o.selector,
            type: o.type,
            value: o.value,
            version: o.version,
            updatedAt: o.updatedAt,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get overrides' },
      });
    }
  }
);

/**
 * POST /api/v1/root/overrides/publish
 * Publish a batch of overrides. Root/Admin only.
 */
rootRouter.post(
  '/overrides/publish',
  authenticate,
  requireRole(['root', 'admin']),
  [
    body('updates').isArray({ min: 1 }),
    body('updates.*.page').isString().notEmpty(),
    body('updates.*.elementId').isString().notEmpty(),
    body('updates.*.selector').isString().notEmpty(),
    body('updates.*.type').optional().isString(),
    body('updates.*.value').isString(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const updates = req.body.updates as Array<{
        page: string;
        elementId: string;
        selector: string;
        type?: string;
        value: string;
      }>;

      const results = [];
      for (const u of updates) {
        const existing = await RootOverride.findOne({ page: u.page, elementId: u.elementId });
        const nextVersion = existing ? existing.version + 1 : 1;

        const saved = await RootOverride.findOneAndUpdate(
          { page: u.page, elementId: u.elementId },
          {
            page: u.page,
            elementId: u.elementId,
            selector: u.selector,
            type: u.type || 'text',
            value: u.value,
            version: nextVersion,
            updatedBy: req.userId,
          },
          { upsert: true, new: true }
        );

        results.push({
          page: saved.page,
          elementId: saved.elementId,
          selector: saved.selector,
          type: saved.type,
          value: saved.value,
          version: saved.version,
          updatedAt: saved.updatedAt,
        });
      }

      res.json({
        success: true,
        data: {
          overrides: results,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to publish overrides' },
      });
    }
  }
);

