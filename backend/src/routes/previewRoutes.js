/**
 * Public link previews:
 * - Instagram: profile API + CDN proxy
 * - LinkedIn: Microlink (og data) + media.licdn.com proxy
 *
 * Uses Node `https` (not global fetch) where Instagram rejects undici/fetch.
 */
import https from 'node:https';
import zlib from 'node:zlib';
import { Router } from 'express';

const router = Router();

const IG_UA = 'Instagram 219.0.0.12.117 Android';
const FETCH_MS = 15000;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    let req;
    const t = setTimeout(() => {
      try {
        req?.destroy();
      } catch {
        /* ignore */
      }
      reject(new Error('timeout'));
    }, FETCH_MS);
    req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': IG_UA,
          Accept: 'application/json',
          'Accept-Encoding': 'identity',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (ch) => chunks.push(ch));
        res.on('end', () => {
          clearTimeout(t);
          let buf = Buffer.concat(chunks);
          const enc = (res.headers['content-encoding'] || '').toLowerCase();
          if (enc.includes('gzip')) {
            try {
              buf = zlib.gunzipSync(buf);
            } catch {
              /* keep raw */
            }
          }
          const body = buf.toString('utf8');
          resolve({ status: res.statusCode || 0, ct: res.headers['content-type'] || '', body });
        });
      }
    );
    req.on('error', (e) => {
      clearTimeout(t);
      reject(e);
    });
    req.end();
  });
}

/** Fetch image bytes from CDN (Referer often required — browser <img> to CDN may 403). */
function httpsGetBinary(imageUrl, referer = 'https://www.instagram.com/') {
  return new Promise((resolve, reject) => {
    const u = new URL(imageUrl);
    const host = u.hostname;
    const isLi = host.includes('licdn.com') || host.includes('linkedin.com');
    const isIgCdn =
      host.includes('fbcdn.net') || host.includes('cdninstagram.com') || host.includes('instagram.com');
    let req;
    const t = setTimeout(() => {
      try {
        req?.destroy();
      } catch {
        /* ignore */
      }
      reject(new Error('timeout'));
    }, FETCH_MS);
    const headers = {
      'User-Agent': BROWSER_UA,
      Referer: referer,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      /** Avoid gzip-compressed bodies — we don't decompress binary streams here. */
      'Accept-Encoding': 'identity',
    };
    if (isLi) {
      headers.Origin = 'https://www.linkedin.com';
    } else if (isIgCdn) {
      headers.Origin = 'https://www.instagram.com';
    }
    req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (ch) => chunks.push(ch));
        res.on('end', () => {
          clearTimeout(t);
          resolve({
            status: res.statusCode || 0,
            ct: res.headers['content-type'] || 'image/jpeg',
            body: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('error', (e) => {
      clearTimeout(t);
      reject(e);
    });
    req.end();
  });
}

/** Generic JSON GET (Microlink etc.) — decompress gzip; some APIs omit JSON if gzip mishandled. */
function httpsGetJsonBrowser(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    let req;
    const t = setTimeout(() => {
      try {
        req?.destroy();
      } catch {
        /* ignore */
      }
      reject(new Error('timeout'));
    }, FETCH_MS);
    req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: 'application/json',
          /** Ask for plain JSON so Node can parse without gunzip (still handle gzip below). */
          'Accept-Encoding': 'identity',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (ch) => chunks.push(ch));
        res.on('end', () => {
          clearTimeout(t);
          let buf = Buffer.concat(chunks);
          const enc = (res.headers['content-encoding'] || '').toLowerCase();
          if (enc.includes('gzip')) {
            try {
              buf = zlib.gunzipSync(buf);
            } catch {
              /* keep raw */
            }
          }
          const body = buf.toString('utf8');
          resolve({ status: res.statusCode || 0, ct: res.headers['content-type'] || '', body });
        });
      }
    );
    req.on('error', (e) => {
      clearTimeout(t);
      reject(e);
    });
    req.end();
  });
}

/** Short in-memory cache to avoid hammering Instagram (username → { url, at }) */
const cache = new Map();
const TTL_MS = 30 * 60 * 1000;
const MAX_CACHE = 400;

function getCached(username) {
  const row = cache.get(username);
  if (!row) return null;
  if (Date.now() - row.at > TTL_MS) {
    cache.delete(username);
    return null;
  }
  return row.url;
}

function setCached(username, url) {
  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
  cache.set(username, { url, at: Date.now() });
}

async function resolveProfilePicUrl(username) {
  const hit = getCached(username);
  if (hit) return hit;

  const apiUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const r = await httpsGetJson(apiUrl);
  if (r.status !== 200) return null;
  const ct = (r.ct || '').toLowerCase();
  if (!ct.includes('application/json')) return null;
  let j;
  try {
    j = JSON.parse(r.body);
  } catch {
    return null;
  }
  const u = j?.data?.user;
  const pic = u?.profile_pic_url_hd || u?.profile_pic_url;
  if (!pic || typeof pic !== 'string') return null;
  setCached(username, pic);
  return pic;
}

/** LinkedIn: Microlink → profile image URL on media.licdn.com */
const cacheLi = new Map();

function getCachedLi(slug) {
  const row = cacheLi.get(slug);
  if (!row) return null;
  if (Date.now() - row.at > TTL_MS) {
    cacheLi.delete(slug);
    return null;
  }
  return row.url;
}

function setCachedLi(slug, url) {
  if (cacheLi.size >= MAX_CACHE) {
    const first = cacheLi.keys().next().value;
    cacheLi.delete(first);
  }
  cacheLi.set(slug, { url, at: Date.now() });
}

/** Match frontend extractLinkedinSlug — parse vanity slug from any pasted LinkedIn input. */
function parseLinkedinSlugFromInput(input) {
  const s = String(input || '').trim();
  if (!s) return null;
  /** Supports /mwlite/in/, /sales/..., and other path prefixes before /in|pub/slug */
  const m =
    s.match(/linkedin\.com\/(?:[\w.-]+\/)*(?:in|pub)\/([^/?\s#]+)/i) ||
    s.match(/linkedin\.com\/(?:in|pub)\/([^/?\s#]+)/i);
  if (m) return decodeURIComponentSafe(m[1]);
  if (!/https?:/i.test(s) && !s.includes('linkedin.com')) {
    const t = s.replace(/^in\//i, '').trim();
    return t ? decodeURIComponentSafe(t) : null;
  }
  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'in' || p === 'pub');
    if (idx >= 0 && parts[idx + 1]) return decodeURIComponentSafe(parts[idx + 1].split('?')[0]);
  } catch {
    /* ignore */
  }
  return null;
}

const LINKEDIN_SHORT_HOSTS = new Set(['lnkd.in', 'www.lnkd.in']);

/** Follow lnkd.in (etc.) to the final www.linkedin.com URL so slug extraction works. */
async function expandShortLinkedinUrl(input) {
  const t = String(input || '').trim();
  if (!t) return t;
  let u;
  try {
    u = new URL(t.startsWith('http') ? t : `https://${t}`);
  } catch {
    return t;
  }
  const host = u.hostname.replace(/^www\./, '');
  if (!LINKEDIN_SHORT_HOSTS.has(host)) return t;
  try {
    const res = await fetch(u.href, {
      redirect: 'follow',
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(FETCH_MS),
    });
    const finalUrl = res.url;
    if (finalUrl && /linkedin\.com/i.test(finalUrl)) return finalUrl;
  } catch {
    /* keep original */
  }
  return t;
}

/** Microlink often sets `logo` to the LinkedIn site icon — never use that as a headshot. */
function pickLinkedinProfileImageUrl(j) {
  const img = j?.data?.image;
  const raw =
    (typeof img?.url === 'string' && img.url) || (typeof img === 'string' && img) || null;
  if (!raw || !/^https:\/\//i.test(raw)) return null;
  const low = raw.toLowerCase();
  if (low.includes('logo.clearbit.com')) return null;
  if (low.includes('static.licdn.com') && low.includes('aero-v1')) return null;
  if (/\.ico(\?|$)/i.test(low)) return null;
  if (low.includes('media.licdn.com')) return raw;
  if (low.includes('profile-displayphoto') || low.includes('/dms/image')) return raw;
  /** Microlink `data.image` (not `logo`) — allow other https URLs when og:image uses an alternate host */
  return raw;
}

function decodeURIComponentSafe(seg) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

async function resolveLinkedinPicUrl(slug) {
  const hit = getCachedLi(slug);
  if (hit) return hit;

  const profileUrl = `https://www.linkedin.com/in/${encodeURIComponent(slug)}/`;
  const micUrl = `https://api.microlink.io/?url=${encodeURIComponent(profileUrl)}`;
  const r = await httpsGetJsonBrowser(micUrl);
  if (r.status !== 200) return null;
  const ct = (r.ct || '').toLowerCase();
  if (!ct.includes('application/json')) return null;
  let j;
  try {
    j = JSON.parse(r.body);
  } catch {
    return null;
  }
  if (j?.status === 'fail' || j?.status === 'error') return null;
  const pic = pickLinkedinProfileImageUrl(j);
  if (!pic) return null;
  setCachedLi(slug, pic);
  return pic;
}

function normalizeLinkedinSlugParam(raw) {
  try {
    return decodeURIComponent(String(raw || '').trim());
  } catch {
    return String(raw || '').trim();
  }
}

async function sendLinkedinAvatarImage(res, slug) {
  if (!slug || slug.length > 200 || /[/\\?<>]/.test(slug)) {
    return res.status(400).end();
  }

  try {
    const picUrl = await resolveLinkedinPicUrl(slug);
    if (!picUrl) {
      return res.status(404).end();
    }
    const img = await httpsGetBinary(picUrl, 'https://www.linkedin.com/');
    if (img.status !== 200 || !img.body?.length) {
      return res.status(404).end();
    }
    const safeCt = /^image\//i.test(img.ct || '') ? img.ct : 'image/jpeg';
    res.setHeader('Content-Type', safeCt);
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(img.body);
  } catch (e) {
    console.error('[preview/linkedin-avatar-img]', e);
    return res.status(502).end();
  }
}

/**
 * LinkedIn avatar by full pasted URL (preferred — server parses slug reliably).
 * GET /api/v1/preview/linkedin-avatar-img?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2F...
 */
router.get('/linkedin-avatar-img', async (req, res) => {
  const raw = req.query.url || req.query.u;
  if (raw == null || String(raw).trim() === '') {
    return res.status(400).end();
  }
  const expanded = await expandShortLinkedinUrl(String(raw).trim());
  const slug = parseLinkedinSlugFromInput(expanded);
  if (!slug) {
    return res.status(400).end();
  }
  return sendLinkedinAvatarImage(res, slug);
});

/**
 * LinkedIn avatar by vanity slug only.
 * GET /api/v1/preview/linkedin-avatar-img/:slug
 */
router.get('/linkedin-avatar-img/:slug', async (req, res) => {
  const slug = normalizeLinkedinSlugParam(req.params.slug);
  return sendLinkedinAvatarImage(res, slug);
});

/**
 * Proxied profile image — use this as <img src> (same origin as API). Avoids CDN hotlink blocks in the browser.
 * GET /api/v1/preview/instagram-avatar-img/:username
 */
router.get('/instagram-avatar-img/:username', async (req, res) => {
  const username = String(req.params.username || '')
    .trim()
    .replace(/^@/, '');
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return res.status(400).end();
  }

  try {
    const picUrl = await resolveProfilePicUrl(username);
    if (!picUrl) {
      return res.status(404).end();
    }
    const img = await httpsGetBinary(picUrl);
    if (img.status !== 200 || !img.body?.length) {
      return res.status(404).end();
    }
    const safeCt = /^image\//i.test(img.ct || '') ? img.ct : 'image/jpeg';
    res.setHeader('Content-Type', safeCt);
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(img.body);
  } catch (e) {
    console.error('[preview/instagram-avatar-img]', e);
    return res.status(502).end();
  }
});

router.get('/instagram-avatar', async (req, res) => {
  const username = String(req.query.username || '')
    .trim()
    .replace(/^@/, '');
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid Instagram username.' } });
  }

  try {
    const pic = await resolveProfilePicUrl(username);
    if (!pic) {
      return res.status(404).json({ success: false, error: { message: 'Instagram profile not found.' } });
    }
    return res.json({ success: true, data: { url: pic } });
  } catch (e) {
    console.error('[preview/instagram-avatar]', e);
    return res.status(502).json({ success: false, error: { message: 'Could not load Instagram profile.' } });
  }
});

export default router;
