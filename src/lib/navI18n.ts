import type { NavItem } from '@/config/navigation';

/** Resolves nav item label: `labelKey`, then `nav.labels.<id>` (no English `label` fallback). */
export function translateNavLabel(item: NavItem, t: (key: string) => string): string {
  if (item.labelKey) {
    const v = t(item.labelKey);
    if (v !== item.labelKey) return v;
  }
  return t(`nav.labels.${item.id}`);
}

/** Resolves optional description: `nav.descriptions.<id>` only (no English fallback). */
export function translateNavDescription(
  item: NavItem & { description?: string },
  t: (key: string) => string
): string | undefined {
  if (!item.description) return undefined;
  const key = `nav.descriptions.${item.id}`;
  const translated = t(key);
  if (translated === key) return undefined;
  return translated;
}
