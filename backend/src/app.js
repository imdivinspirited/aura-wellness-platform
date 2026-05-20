import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, getApiPrefix, isProd } from './config.js';
import { isMongoReady } from './db.js';
import { isEmailConfigured } from './services/email.ts';
import { mountAdminMediaRaw } from './routes/adminMediaUpload.js';
import { createApiV1Router, logApiV1Bootstrap } from './routes/apiV1Router.js';
import { pingElasticsearch } from './services/elasticsearchClient.js';
import { getElasticsearchUrl } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setupExpressApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProd() ? undefined : false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      originAgentCluster: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      strictTransportSecurity: isProd()
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
    })
  );
  app.use(cookieParser());
  app.use(
    cors({
      /** Dev: reflect request Origin so [::1], LAN IPs, and localhost:8080 ↔ 127.0.0.1:4000 all work with credentials. */
      origin: isProd()
        ? config.corsOrigins.length
          ? config.corsOrigins
          : true
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Anonymous-Id',
        'X-CSRF-Token',
        'X-Device-Id',
      ],
    })
  );

  const prefix = getApiPrefix();

  mountAdminMediaRaw(app, prefix);

  app.use(express.json({ limit: '2mb' }));

  /** Body-parser JSON errors must not bubble as uncaught / empty 500. */
  app.use((err, _req, res, next) => {
    const isParse =
      err?.type === 'entity.parse.failed' ||
      (err instanceof SyntaxError && err && 'body' in /** @type {object} */ (err));
    if (isParse && !res.headersSent) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_JSON', message: 'Invalid JSON body.' },
      });
    }
    return next(err);
  });

  const uploadRoot = path.join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(uploadRoot));

  return app;
}

/**
 * Registers all JSON API routes under `API_PREFIX` (default `/api/v1`) via {@link createApiV1Router}.
 */
export function mountApiV1Routes(app) {
  const prefix = getApiPrefix();
  const v1 = createApiV1Router();
  app.use(prefix, v1);
  if (prefix !== '/api/v1') {
    app.use('/api/v1', v1);
  }
  logApiV1Bootstrap(prefix);

  app.get('/healthz', async (_req, res) => {
    const mongo = isMongoReady();
    const esUrl = getElasticsearchUrl();
    let elasticsearch = { configured: Boolean(esUrl), ok: false };
    if (esUrl) {
      const ping = await pingElasticsearch();
      elasticsearch = { configured: true, ok: ping.ok, detail: ping.reason || undefined };
    }
    res.json({
      ok: true,
      service: 'aolic-bangalore-api',
      mongoReady: mongo,
      emailConfigured: isEmailConfigured(),
      elasticsearch,
      time: new Date().toISOString(),
    });
  });
}

export function attachFallbackHandlers(app) {
  app.use((req, res) => {
    const pathStr = (req.originalUrl || req.url || '').split('?')[0];
    res.status(404).json({
      success: false,
      message: `No route ${req.method} ${pathStr}`,
      error: { code: 'NOT_FOUND', message: `No route ${req.method} ${pathStr}` },
      availableRoutes: [
        'POST /api/v1/root/signup',
        'POST /api/v1/root/login',
        'POST /api/v1/root/refresh',
        'POST /api/v1/root/logout',
        'GET  /api/v1/root/me',
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'GET  /api/v1/users/profile/full',
        'PUT  /api/v1/users/profile/full',
        'GET  /api/v1/users/resume.pdf',
        'GET  /api/v1/editor/pages/:slug',
        'PUT  /api/v1/editor/pages/:slug',
        'PATCH /api/v1/editor/pages/:slug',
        'GET  /healthz',
      ],
    });
  });

  app.use((err, _req, res, _next) => {
    console.error('[unhandled]', err);
    if (res.headersSent) {
      return;
    }
    const devDetail =
      !isProd() && err && typeof err === 'object' && 'message' in err
        ? String(/** @type {{ message?: unknown }} */ (err).message)
        : '';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL',
        message: 'Unexpected server error.',
        ...(devDetail ? { detail: devDetail.slice(0, 800) } : {}),
      },
    });
  });
}

export function createApp() {
  const app = setupExpressApp();
  mountApiV1Routes(app);
  attachFallbackHandlers(app);
  return app;
}
