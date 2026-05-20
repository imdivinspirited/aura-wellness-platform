/**
 * Platform-only search: chatbot/data/ files + site searchIndex.
 * No Supabase. Used for "Platform Only" mode.
 */

import Fuse from 'fuse.js';
import { searchIndex } from '@/data/searchIndex';

const DATA_BASE = '/chatbot/data';
const CONFIDENCE_THRESHOLD = 0.5;

export interface PlatformResult {
  answer: string;
  source: 'platform';
}

const textExtensions = ['.txt', '.md', '.json'];

async function loadDataFiles(): Promise<string> {
  const files = ['general.txt'];
  let combined = '';
  for (const name of files) {
    try {
      const res = await fetch(`${DATA_BASE}/${name}`);
      if (res.ok) {
        const text = await res.text();
        combined += '\n\n' + text;
      }
    } catch {
      // ignore fetch errors
    }
  }
  return combined.trim();
}

function buildSearchableItems(): Array<{ id: string; text: string }> {
  const items: Array<{ id: string; text: string }> = [];
  for (const item of searchIndex) {
    items.push({
      id: item.id,
      text: [item.title, item.description, item.category, ...item.tags].filter(Boolean).join(' '),
    });
  }
  return items;
}

let cachedDataText: string | null = null;
let cachedFuse: Fuse<{ id: string; text: string }> | null = null;
let cachedSiteItems: Array<{ id: string; text: string }> | null = null;

async function getDataText(): Promise<string> {
  if (cachedDataText !== null) return cachedDataText;
  cachedDataText = await loadDataFiles();
  return cachedDataText;
}

function getSiteFuse(): Fuse<{ id: string; text: string }> {
  if (cachedFuse && cachedSiteItems) return cachedFuse;
  cachedSiteItems = buildSearchableItems();
  cachedFuse = new Fuse(cachedSiteItems, {
    keys: ['text'],
    threshold: 0.4,
    includeScore: true,
  });
  return cachedFuse;
}

/**
 * Search platform content only (data folder + site index).
 * Returns answer and source 'platform', or null if no good match.
 */
export async function searchPlatform(query: string): Promise<PlatformResult | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    const dataText = await getDataText();
    const siteFuse = getSiteFuse();

    const combinedText = dataText + '\n\n' + cachedSiteItems!.map((i) => i.text).join('\n');
    const dataFuse = new Fuse([{ id: 'data', text: combinedText }], {
      keys: ['text'],
      threshold: 0.5,
      includeScore: true,
    });

    const dataResults = dataFuse.search(q);
    const siteResults = siteFuse.search(q);

    const bestData = dataResults[0];
    const bestSite = siteResults[0];

    let bestScore = 1;
    let snippet = '';

    if (bestData && typeof bestData.score === 'number' && bestData.score < bestScore) {
      bestScore = bestData.score;
      const text = (bestData.item as { id: string; text: string }).text;
      snippet = text.slice(0, 400) + (text.length > 400 ? '…' : '');
    }
    if (bestSite && typeof bestSite.score === 'number' && bestSite.score < bestScore) {
      bestScore = bestSite.score;
      const item = searchIndex.find((i) => i.id === (bestSite.item as { id: string }).id);
      if (item) {
        snippet = `${item.title}. ${item.description}`.slice(0, 400);
      }
    }

    if (snippet && bestScore <= CONFIDENCE_THRESHOLD) {
      return {
        answer: snippet.trim(),
        source: 'platform',
      };
    }
    return null;
  } catch {
    return null;
  }
}
