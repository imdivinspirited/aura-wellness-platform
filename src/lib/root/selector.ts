/**
 * Root Mode - Selector + Stable Element ID
 *
 * Goal: allow Root mode to target ANY DOM element without requiring `RootEditable` wrappers.
 * We compute a reasonably-stable CSS selector and derive a stable elementId.
 *
 * Notes:
 * - We do NOT mutate existing component code.
 * - We only attach `data-root-id` at runtime when Root mode is active.
 * - Stability is best-effort (DOM changes can invalidate selectors); versioning + manual retargeting
 *   will be added in the next iteration.
 */

export type RootRuntimeTarget = {
  elementId: string;
  selector: string;
};

function djb2Hash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Force unsigned
  return (hash >>> 0).toString(36);
}

function isSkippable(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return true;
  // Never allow editing our own overlays / portals
  if (el.closest('.root-hover-indicator, .root-edit-panel, .root-toolbar')) return true;
  if (el.closest('[data-root-editor-ui="true"]')) return true;
  return false;
}

export function buildCssSelector(el: Element): string {
  // Prefer an explicit stable hook if present
  const dataId = (el as HTMLElement).getAttribute?.('data-root-id');
  if (dataId) return `[data-root-id="${CSS.escape(dataId)}"]`;

  const parts: string[] = [];
  let current: Element | null = el;
  let depth = 0;

  while (current && current.nodeType === 1 && depth < 6) {
    if (isSkippable(current)) {
      current = current.parentElement;
      continue;
    }

    const tag = current.tagName.toLowerCase();
    const id = (current as HTMLElement).id;
    if (id) {
      parts.unshift(`${tag}#${CSS.escape(id)}`);
      break; // ID is typically unique enough
    }

    const classList = Array.from((current as HTMLElement).classList || [])
      .filter((c) => c && !c.startsWith('root-'))
      .slice(0, 2);

    // nth-of-type for sibling disambiguation
    const parent = current.parentElement;
    let nth = 1;
    if (parent) {
      const siblings = Array.from(parent.children).filter((c) => c.tagName === current!.tagName);
      nth = siblings.indexOf(current) + 1;
    }

    const cls = classList.length ? `.${classList.map((c) => CSS.escape(c)).join('.')}` : '';
    parts.unshift(`${tag}${cls}:nth-of-type(${nth})`);

    current = current.parentElement;
    depth++;
  }

  return parts.join(' > ');
}

export function getOrAssignRuntimeRootId(
  el: Element,
  pagePath: string
): RootRuntimeTarget | null {
  if (isSkippable(el)) return null;

  const existing = (el as HTMLElement).getAttribute?.('data-root-id');
  if (existing) {
    return { elementId: existing, selector: `[data-root-id="${CSS.escape(existing)}"]` };
  }

  const selector = buildCssSelector(el);
  // Stable-ish elementId derived from page + selector
  const elementId = `el_${djb2Hash(`${pagePath}::${selector}`)}`;
  (el as HTMLElement).setAttribute('data-root-id', elementId);
  (el as HTMLElement).setAttribute('data-root-auto', 'true');
  return { elementId, selector };
}
