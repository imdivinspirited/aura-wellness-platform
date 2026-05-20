/** Page size presets for PDF + live preview (width/height in mm). */

export const PAGE_SIZE_PRESETS = {
  A4: { label: 'A4 (ISO)', widthMm: 210, heightMm: 297 },
  LETTER: { label: 'US Letter', widthMm: 215.9, heightMm: 279.4 },
  LEGAL: { label: 'US Legal', widthMm: 215.9, heightMm: 355.6 },
  A3: { label: 'A3 (ISO)', widthMm: 297, heightMm: 420 },
} as const;

export type PageSizePreset = keyof typeof PAGE_SIZE_PRESETS;

export function pageSizeLabel(key: string): string {
  return PAGE_SIZE_PRESETS[key as PageSizePreset]?.label ?? PAGE_SIZE_PRESETS.A4.label;
}

export function pageAspectStyle(pageSize: string): string {
  const p = PAGE_SIZE_PRESETS[pageSize as PageSizePreset] ?? PAGE_SIZE_PRESETS.A4;
  return `${p.widthMm} / ${p.heightMm}`;
}

/** PDFKit size option */
export function pdfKitPageSize(pageSize: string): 'A4' | 'A3' | 'LEGAL' | 'LETTER' {
  const k = String(pageSize || 'A4').toUpperCase();
  if (k === 'A3' || k === 'LEGAL' || k === 'LETTER' || k === 'A4') return k as 'A4' | 'A3' | 'LEGAL' | 'LETTER';
  return 'A4';
}
