/**
 * Public channel Atom feed → JSON (no API key). Used when Data API fails or is unconfigured.
 * GET /videos?channelId=UC...
 */
import { Router } from 'express';

const router = Router();

const FEED = 'https://www.youtube.com/feeds/videos.xml';

function decodeXmlEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * @param {string} xml
 * @returns {Array<{ videoId: string; title: string; description: string; thumbnailUrl: string; publishedAt: string }>}
 */
function parseYoutubeAtomFeed(xml) {
  const items = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId =
      block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ||
      block.match(/<id>yt:video:([^<]+)<\/id>/)?.[1];
    const titleRaw = block.match(/<title(?:\s[^>]*)?>([^<]*)<\/title>/)?.[1];
    const publishedAt = block.match(/<published>([^<]+)<\/published>/)?.[1];
    const descRaw =
      block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || '';
    const thumb =
      block.match(/<media:thumbnail\s+url="([^"]+)"/)?.[1] ||
      block.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];
    if (!videoId || !titleRaw) continue;
    items.push({
      videoId: videoId.trim(),
      title: decodeXmlEntities(titleRaw.trim()),
      description: decodeXmlEntities(descRaw.trim()),
      thumbnailUrl: thumb?.trim() || `https://i.ytimg.com/vi/${videoId.trim()}/hqdefault.jpg`,
      publishedAt: publishedAt?.trim() || new Date(0).toISOString(),
    });
  }
  return items;
}

async function fetchFeedXml(channelId) {
  const url = `${FEED}?channel_id=${encodeURIComponent(channelId)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/atom+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; AOLIC-Wellness/1.0; +https://www.youtube.com/feeds/videos.xml)',
      },
      signal: controller.signal,
    });
    if (!r.ok) {
      return { ok: false, status: r.status, xml: null };
    }
    const xml = await r.text();
    return { ok: true, status: r.status, xml };
  } finally {
    clearTimeout(timer);
  }
}

router.get('/videos', async (req, res) => {
  try {
    const channelId = typeof req.query.channelId === 'string' ? req.query.channelId.trim() : '';
    if (!channelId || !/^UC[\w-]{10,}$/.test(channelId)) {
      return res.status(400).json({
        ok: false,
        error: { message: 'Valid channelId query parameter is required (YouTube channel ID).' },
      });
    }

    let attempt = await fetchFeedXml(channelId);
    if (!attempt.ok && attempt.status >= 500) {
      await new Promise((r) => setTimeout(r, 400));
      attempt = await fetchFeedXml(channelId);
    }

    if (!attempt.ok || !attempt.xml) {
      return res.status(attempt.ok ? 500 : attempt.status || 503).json({
        ok: false,
        error: {
          message:
            attempt.status === 429
              ? 'YouTube rate-limited the feed request; try again shortly.'
              : 'Could not fetch YouTube channel feed.',
        },
        items: [],
      });
    }

    const items = parseYoutubeAtomFeed(attempt.xml);
    return res.status(200).json({ ok: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unexpected error';
    return res.status(500).json({ ok: false, error: { message: msg }, items: [] });
  }
});

export default router;
