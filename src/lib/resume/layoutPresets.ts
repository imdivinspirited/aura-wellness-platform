import type { ResumeDocumentV1 } from '@/lib/resume/types';

export type LayoutPresetId = 'balanced' | 'ats_tight' | 'spacious' | 'reader';

export const LAYOUT_PRESET_OPTIONS: { id: LayoutPresetId; label: string; hint: string }[] = [
  { id: 'balanced', label: 'Balanced', hint: 'Default rhythm for most roles' },
  { id: 'ats_tight', label: 'ATS tight', hint: 'Compact — more content per page' },
  { id: 'spacious', label: 'Spacious', hint: 'More air between sections' },
  { id: 'reader', label: 'Reader', hint: 'Larger type & line height' },
];

/** One-shot spacing / type bundles (structured layout only). */
export function layoutPresetPatch(id: LayoutPresetId): Partial<ResumeDocumentV1['layout']> {
  switch (id) {
    case 'balanced':
      return {
        density: 'comfortable',
        fontScale: 1,
        lineHeightScale: 1.35,
        sectionGapScale: 1,
        pdfTypography: 'standard',
        contentPaddingMm: 10,
      };
    case 'ats_tight':
      return {
        density: 'compact',
        fontScale: 0.94,
        lineHeightScale: 1.22,
        sectionGapScale: 0.82,
        pdfTypography: 'compact',
        contentPaddingMm: 8,
      };
    case 'spacious':
      return {
        density: 'comfortable',
        fontScale: 1.04,
        lineHeightScale: 1.42,
        sectionGapScale: 1.12,
        pdfTypography: 'standard',
        contentPaddingMm: 12,
      };
    case 'reader':
      return {
        density: 'comfortable',
        fontScale: 1.08,
        lineHeightScale: 1.52,
        sectionGapScale: 1.08,
        pdfTypography: 'large',
        contentPaddingMm: 11,
      };
    default:
      return {};
  }
}
