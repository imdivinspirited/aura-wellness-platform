import { Router } from 'express';
import { requireRootAuth } from '../middleware/rootAuthMiddleware.js';
import { requireMongoReady } from '../middleware/requireMongoReady.js';
import {
  getEditorPage,
  getEditorHistory,
  patchEditorPage,
  saveEditorPage,
} from '../controllers/editorPagesController.js';

const router = Router();

router.use(requireRootAuth);
router.use(requireMongoReady);

/** Register specific paths before `/:slug` so `history` is not captured as a slug. */
router.get('/pages/:slug/history', getEditorHistory);
router.get('/pages/:slug', getEditorPage);
router.put('/pages/:slug', saveEditorPage);
router.post('/pages/:slug', saveEditorPage);
router.patch('/pages/:slug', patchEditorPage);

export default router;
