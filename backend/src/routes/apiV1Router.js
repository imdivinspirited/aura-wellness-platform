/**
 * Single mount point for all `/api/v1/*` routes (and `${API_PREFIX}/*` when overridden).
 * Order: `/root` first so signup/login are never shadowed by global middleware.
 */
import { Router } from 'express';
import { isProd } from '../config.js';
import { isMongoReady } from '../db.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';
import authRoutes from './authRoutes.js';
import rootPublicRoutes from './rootPublicRoutes.js';
import cartRoutes from './cartRoutes.js';
import adminRoutes from './adminRoutes.js';
import oauthRoutes from './oauthRoutes.js';
import rootAuthRoutes from './rootAuthRoutes.js';
import editorRoutes from './editorRoutes.js';
import deployRoutes from './deployRoutes.js';
import moodRoutes from './moodRoutes.js';
import usersProfileRoutes from './usersProfileRoutes.js';
import geoRoutes from './geoRoutes.js';
import previewRoutes from './previewRoutes.js';
import youtubeDataRoutes from './youtubeDataRoutes.js';
import youtubeRssRoutes from './youtubeRssRoutes.js';
import eventInterestRoutes from './eventInterestRoutes.js';
import notificationsRoutes from './notificationsRoutes.js';
import searchRoutes from './searchRoutes.js';

export function createApiV1Router() {
  const router = Router();

  /** Public root endpoints (e.g. published page overrides) — must register before rootAuthRoutes. */
  router.use('/root', rootPublicRoutes);
  router.use('/root', rootAuthRoutes);
  /** Public geo lookups (countries / states / cities / India PIN) */
  router.use('/geo', geoRoutes);
  /** Link previews (e.g. Instagram profile image) */
  router.use('/preview', previewRoutes);
  /** YouTube Data API v3 proxy (search / videos) — uses YOUTUBE_API_KEY in backend/.env */
  router.use('/youtube/v3', youtubeDataRoutes);
  /** Public channel RSS → JSON (no API key) — fallback for Past tab */
  router.use('/youtube/rss', youtubeRssRoutes);
  /** Public POST + root GET: event interest (e.g. Gurudev birthday registrations) */
  router.use('/events', eventInterestRoutes);
  /** Per-user in-app notifications (Mongo) + worker fan-out */
  router.use('/notifications', notificationsRoutes);
  /** Elasticsearch site search + click signals (Mongo) + optional hybrid rerank */
  router.use('/search', searchRoutes);

  /**
   * Auth routes must NOT sit behind express-rate-limit: v7's IP / trust-proxy validations and
   * proxy interaction caused empty 5xx responses for POST /auth/login behind Vite (:8080 → :4000).
   * Register has per-IP limits; login uses brute-force lockout in authRoutes.
   */
  router.use(
    '/auth',
    (req, res, next) => {
      if (isMongoReady()) return next();
      const err = new Error('MongoDB is not connected.');
      err.code = 'MONGO_UNAVAILABLE';
      if (respondIfMongoOrDbUnavailable(res, err)) return;
      return next(err);
    },
    authRoutes
  );

  router.use('/users', usersProfileRoutes);
  router.use('/mood', moodRoutes);
  router.use('/carts', cartRoutes);
  router.use('/admin', adminRoutes);
  router.use('/oauth', oauthRoutes);
  router.use('/editor', editorRoutes);
  router.use('/deploy', deployRoutes);

  return router;
}

/** Dev: print high-signal API paths once */
export function logApiV1Bootstrap(prefix) {
  if (isProd()) return;
  const base = prefix || '/api/v1';
  console.log('[routes] API mounted at', base);
  console.log('[routes]  POST', `${base}/root/signup`);
  console.log('[routes]  POST', `${base}/root/login`);
  console.log('[routes]  POST', `${base}/root/refresh`);
  console.log('[routes]  POST', `${base}/root/logout`);
  console.log('[routes]  GET ', `${base}/root/me`);
  console.log('[routes]  POST', `${base}/auth/register`);
  console.log('[routes]  POST', `${base}/auth/login`);
  console.log('[routes]  GET ', `${base}/users/profile/full`);
  console.log('[routes]  PUT ', `${base}/users/profile/full`);
  console.log('[routes]  GET ', `${base}/users/public/:userId`);
  console.log('[routes]  GET ', `${base}/users/resume.pdf`);
  console.log('[routes]  GET ', `${base}/editor/pages/:slug`);
  console.log('[routes]  PUT ', `${base}/editor/pages/:slug`);
  console.log('[routes]  PATCH', `${base}/editor/pages/:slug`);
  console.log('[routes]  POST', `${base}/events/:eventSlug/interest`);
  console.log('[routes]  GET ', `${base}/events/interest/registrations`);
  console.log('[routes]  POST', `${base}/search/query`);
  console.log('[routes]  POST', `${base}/search/click`);
  console.log('[routes]  GET ', `${base}/search/health`);
}
