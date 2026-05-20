/**
 * Content (Public) Routes
 *
 * Public-read CMS pages and related entities.
 */

import { Router, Response } from 'express';
import { param, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Page } from '../models/Page';

export const contentRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/content/pages?language=en
 * Public list of published pages.
 */
contentRouter.get(
  '/pages',
  authenticate,
  [query('language').optional().isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const language = String(req.query.language || 'en');
    const pages = await Page.find({ status: 'published', language }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: { pages } });
    return;
  }
);

/**
 * GET /api/v1/content/pages/:slug?language=en
 * Public get published page by slug.
 */
contentRouter.get(
  '/pages/:slug',
  authenticate,
  [param('slug').isString().trim().notEmpty(), query('language').optional().isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const slug = String(req.params.slug).toLowerCase();
    const language = String(req.query.language || 'en');
    const page = await Page.findOne({ slug, status: 'published', language }).lean();
    if (!page) {
      return res.status(404).json({ success: false, error: { message: 'Page not found' } });
    }
    res.json({ success: true, data: { page } });
    return;
  }
);

