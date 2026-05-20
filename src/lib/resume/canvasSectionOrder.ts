import { arrayMove } from '@dnd-kit/sortable';
import type { ResumeDocumentV1 } from '@/lib/resume/types';

/** Canonical canvas / layout section ids (body — below header). */
export const CANVAS_SECTION_IDS = [
  'summary',
  'experience',
  'education',
  'projects',
  'certifications',
  'languages',
  'skills',
  'custom',
  'profileDetails',
  'achievements',
] as const;

export type CanvasSectionId = (typeof CANVAS_SECTION_IDS)[number];

const ALLOWED = new Set<string>(CANVAS_SECTION_IDS);

export function mergeCanvasSectionOrder(stored: string[] | undefined): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  if (stored?.length) {
    for (const id of stored) {
      if (ALLOWED.has(id) && !seen.has(id)) {
        out.push(id);
        seen.add(id);
      }
    }
  }
  for (const id of CANVAS_SECTION_IDS) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export function isCanvasSectionVisible(doc: ResumeDocumentV1, id: string): boolean {
  const v = doc.visibility;
  switch (id) {
    case 'summary':
      return v.summary;
    case 'experience':
      return v.experience;
    case 'education':
      return v.education;
    case 'projects':
      return v.projects;
    case 'certifications':
      return v.certifications;
    case 'languages':
      return v.languages;
    case 'skills':
      return v.skills;
    case 'custom':
      return v.custom;
    case 'profileDetails':
      return v.profileDetails;
    case 'achievements':
      return v.achievements;
    default:
      return false;
  }
}

/** After dragging section `active` before/after `over`, merge new visible order into full layout.sectionOrder. */
export function reorderCanvasSections(
  doc: ResumeDocumentV1,
  activeKey: string,
  overKey: string
): string[] {
  const full = mergeCanvasSectionOrder(doc.layout.sectionOrder);
  const visible = full.filter((k) => isCanvasSectionVisible(doc, k));
  const oi = visible.indexOf(activeKey);
  const ni = visible.indexOf(overKey);
  if (oi < 0 || ni < 0 || oi === ni) return full;
  const visNew = arrayMove(visible, oi, ni);
  let j = 0;
  return full.map((k) => (isCanvasSectionVisible(doc, k) ? visNew[j++]! : k));
}
