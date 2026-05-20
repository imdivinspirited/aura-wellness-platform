/**
 * Lazy Elasticsearch client — created when ELASTICSEARCH_URL is set.
 */
import { Client } from '@elastic/elasticsearch';
import { getElasticsearchUrl } from '../config.js';

/** @type {Client | null} */
let client = null;

/**
 * @returns {Client | null}
 */
export function getElasticsearchClient() {
  const url = getElasticsearchUrl();
  if (!url) return null;
  if (!client) {
    client = new Client({ node: url });
  }
  return client;
}

export async function pingElasticsearch() {
  const c = getElasticsearchClient();
  if (!c) return { ok: false, reason: 'no_url' };
  try {
    await c.ping();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || String(e) };
  }
}
