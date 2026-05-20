import { createServer } from 'http';
import './bootstrap.js';

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
import { setupExpressApp, mountApiV1Routes, attachFallbackHandlers } from './app.js';
import { config, getApiPrefix, getMongoConnectionString, isProd } from './config.js';
import { connectMongo, getDb, isMongoReady } from './db.js';
import { startNotificationWorker } from './services/notificationWorker.js';
import { attachRealtime } from './realtime.js';
import { isEmailConfigured } from './services/email.ts';

if (isProd() && !getMongoConnectionString()) {
  console.error(
    '[boot] Production requires MONGODB_URI or DATABASE_URL (mongodb+srv:// or mongodb://) in backend/.env'
  );
  process.exit(1);
}

const app = setupExpressApp();
mountApiV1Routes(app);
attachFallbackHandlers(app);

const port = config.port;

await connectMongo();

if (isProd() && !isMongoReady()) {
  console.error(
    '[boot] FATAL: MongoDB did not connect. Check MONGODB_URI, credentials, and Atlas network access, then restart.'
  );
  process.exit(1);
}
if (!isProd() && !isMongoReady()) {
  console.warn(
    '[boot] MongoDB is not connected — database routes will return errors until MONGODB_URI is set and the server can reach the cluster.'
  );
}

const httpServer = createServer(app);
attachRealtime(httpServer);

httpServer.listen(port, () => {
  const api = getApiPrefix();
  if (isMongoReady()) {
    try {
      const workerEnabledRaw = String(process.env.NOTIFICATION_WORKER_ENABLED ?? '').trim();
      const workerEnabled = workerEnabledRaw ? workerEnabledRaw !== '0' && workerEnabledRaw.toLowerCase() !== 'false' : true;
      if (workerEnabled) {
        startNotificationWorker(() => getDb(), { intervalMs: 90_000 });
        console.log('[aolic-bangalore-api] notification worker: every 90s (YouTube + event reminders + TTL purge)');
      } else {
        console.log('[aolic-bangalore-api] notification worker: disabled via NOTIFICATION_WORKER_ENABLED=0');
      }
    } catch (e) {
      console.warn('[aolic-bangalore-api] notification worker not started:', e?.message || e);
    }
  }
  console.log(`[aolic-bangalore-api] listening on http://localhost:${port}`);
  console.log(`[aolic-bangalore-api] health: http://localhost:${port}/healthz`);
  console.log(`[aolic-bangalore-api] api prefix: ${api}`);
  console.log(`[aolic-bangalore-api] root signup: POST http://localhost:${port}/api/v1/root/signup`);
  console.log(`[aolic-bangalore-api] socket.io enabled`);

  if (!isProd()) {
    const j = (config.jwtAccessSecret || '').trim();
    if (!j || /replace-with|change-me|^dev-only-/i.test(j)) {
      console.warn(
        '[boot] Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in backend/.env (e.g. openssl rand -base64 48) — placeholder secrets can break sign-in.'
      );
    }
  }

  if (!isEmailConfigured()) {
    const msg =
      '[boot] SMTP is not configured — verification and password-reset emails are NOT sent. Set SMTP_URL or SMTP_HOST + SMTP_USER + SMTP_PASS in backend/.env, then run: cd backend && npm run test:smtp';
    if (isProd()) {
      console.error(msg);
    } else {
      console.warn(msg);
    }
  }
});
