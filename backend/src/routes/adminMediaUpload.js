import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAuth } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireRoles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.join(__dirname, '..', '..', 'uploads');

/** Registered before express.json() so raw body is preserved for large uploads. */
export function mountAdminMediaRaw(app, prefix) {
  app.put(
    `${prefix}/admin/media/raw/:assetId`,
    authenticate,
    requireAuth,
    requireAdmin,
    express.raw({ type: '*/*', limit: '40mb' }),
    async (req, res) => {
      try {
        await fs.mkdir(uploadRoot, { recursive: true });
        const filePath = path.join(uploadRoot, req.params.assetId);
        await fs.writeFile(filePath, req.body);
        const publicUrl = `/uploads/${req.params.assetId}`;
        await getDb()
          .collection('cms_media_assets')
          .updateOne({ id: req.params.assetId }, { $set: { cdn_url: publicUrl } });
        res.status(204).end();
      } catch (err) {
        console.error('[media upload]', err);
        res.status(500).json({ success: false, error: { message: 'Upload failed' } });
      }
    }
  );
}
