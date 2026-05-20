/**
 * YouTube Data API v3 proxy — forwards GET /search and GET /videos to Google.
 * Browser uses this when VITE_YOUTUBE_API_KEY is unset (keeps key off the client).
 */
import { Router } from 'express';

const GOOGLE_YT = 'https://www.googleapis.com/youtube/v3';

const router = Router();

router.use(async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        error: {
          code: 503,
          message: 'YouTube Data API proxy requires YOUTUBE_API_KEY in backend/.env',
          errors: [{ domain: 'global', reason: 'backendKeyMissing', message: 'YOUTUBE_API_KEY not set' }],
        },
      });
    }

    const name = (req.path || '/').replace(/^\//, '') || '';
    if (name !== 'search' && name !== 'videos') {
      return res.status(404).json({
        error: {
          code: 404,
          message: `Unknown resource: ${name}. Expected search or videos.`,
          errors: [{ reason: 'notFound' }],
        },
      });
    }

    const target = new URL(`${GOOGLE_YT}/${name}`);
    for (const [k, raw] of Object.entries(req.query)) {
      if (raw === undefined) continue;
      if (Array.isArray(raw)) raw.forEach((v) => target.searchParams.append(k, String(v)));
      else target.searchParams.set(k, String(raw));
    }
    target.searchParams.set('key', apiKey);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 25_000);
    let upstream;
    try {
      upstream = await fetch(target.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(t);
      const msg = e instanceof Error ? e.message : 'network error';
      return res.status(503).json({
        error: {
          code: 503,
          message: `Upstream YouTube Data API unreachable: ${msg}`,
          errors: [{ reason: 'upstreamFetchFailed', message: msg }],
        },
      });
    }
    clearTimeout(t);

    const text = await upstream.text();
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    return res.status(upstream.status).send(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unexpected error';
    return res.status(500).json({
      error: { code: 500, message: msg, errors: [{ reason: 'youtubeProxyError' }] },
    });
  }
});

export default router;
