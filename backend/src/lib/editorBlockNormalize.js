/**
 * Canonical editor block: { id, type, content }
 * Migrates legacy { componentId, componentType, props, content } from older saves.
 */

function randomId() {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * @param {unknown} raw
 * @returns {{ id: string, type: string, content: Record<string, unknown> } | null}
 */
export function normalizeBlock(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const o = /** @type {Record<string, unknown>} */ (raw);

  if (typeof o.id === 'string' && typeof o.type === 'string') {
    const content = isPlainObject(o.content) ? { ...o.content } : {};
    return { id: o.id, type: o.type, content };
  }

  const id =
    (typeof o.componentId === 'string' && o.componentId) ||
    (typeof o.id === 'string' && o.id) ||
    randomId();

  const typeRaw =
    (typeof o.componentType === 'string' && o.componentType) ||
    (typeof o.type === 'string' && o.type) ||
    'text';

  const type = String(typeRaw).toLowerCase();

  const props = isPlainObject(o.props) ? o.props : {};
  const legacyContent = isPlainObject(o.content) ? o.content : {};

  const content = { ...props, ...legacyContent };

  return { id, type, content };
}

/**
 * @param {unknown} arr
 * @returns {Array<{ id: string, type: string, content: Record<string, unknown> }>}
 */
export function normalizeBlocksArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeBlock).filter(Boolean);
}
