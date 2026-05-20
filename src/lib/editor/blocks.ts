/**
 * Canonical canvas block — mirrors API `{ id, type, content }`.
 */

export type CanvasBlock = {
  id: string;
  type: string;
  content: Record<string, unknown>;
};

function randomId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Normalize API / legacy rows into canonical blocks. */
export function normalizeBlocksClient(raw: unknown): CanvasBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeOne).filter((b): b is CanvasBlock => b !== null);
}

function normalizeOne(raw: unknown): CanvasBlock | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  if (typeof o.id === 'string' && typeof o.type === 'string') {
    return {
      id: o.id,
      type: o.type,
      content: isPlainObject(o.content) ? { ...o.content } : {},
    };
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

  return { id, type, content: { ...props, ...legacyContent } };
}

export function createBlock(type: string): CanvasBlock {
  const id = randomId();
  const t = type.toLowerCase();
  const content: Record<string, unknown> = {};

  switch (t) {
    case 'hero':
      content.headline = 'Your headline';
      content.subhead = 'Supporting text — edit inline or in the sidebar.';
      break;
    case 'text':
      content.html = '<p>Start writing. Changes stay in memory until you save.</p>';
      break;
    case 'cta':
      content.label = 'Call to action';
      content.href = '/programs';
      break;
    case 'section':
      content.title = 'Section';
      break;
    case 'image':
      content.src = '/images/hero/hero_landing_ashram_mobile.jpg';
      content.alt = 'Image';
      break;
    default:
      content.note = 'Custom block';
  }

  return { id, type: t, content };
}
