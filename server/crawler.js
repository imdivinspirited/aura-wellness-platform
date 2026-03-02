import cheerio from 'cheerio';
import { upsertPage } from './rag.js';

const WEBSITE_URL = process.env.WEBSITE_URL || 'https://www.artofliving.org';
const MAX_PAGES = Number(process.env.CRAWLER_MAX_PAGES || 500);

function normalizeUrl(href, baseOrigin) {
  try {
    const url = new URL(href, baseOrigin);
    if (url.origin !== baseOrigin) return null;
    // strip hash
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

function extractText(html) {
  const $ = cheerio.load(html);
  // remove non-content elements
  ['script', 'style', 'noscript', 'nav', 'footer'].forEach((sel) => $(sel).remove());
  const text = $('body').text();
  return text.replace(/\s+/g, ' ').trim();
}

export async function crawlAndIndex() {
  const startUrl = WEBSITE_URL;
  const origin = new URL(startUrl).origin;
  const queue = [startUrl];
  const visited = new Set();
  let pagesProcessed = 0;

  console.log('[crawler] Starting crawl from', startUrl);

  while (queue.length && pagesProcessed < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) {
        continue;
      }
      const html = await res.text();
      const text = extractText(html);
      if (text.length > 0) {
        await upsertPage({ url, content: text });
        pagesProcessed += 1;
        console.log(`[crawler] Indexed (${pagesProcessed}) ${url}`);
      }

      const $ = cheerio.load(html);
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const next = normalizeUrl(href, origin);
        if (!next) return;
        if (!visited.has(next)) queue.push(next);
      });
    } catch (err) {
      console.warn('[crawler] Failed to crawl', url, err?.message || err);
    }
  }

  console.log('[crawler] Finished crawl. Pages processed:', pagesProcessed);
}

