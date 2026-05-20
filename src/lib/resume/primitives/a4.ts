/** ISO 216 A-series & print-layout helpers (resume PDF / preview alignment). */
import { clamp01 } from './numbers';

export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const MM_TO_PT = 72 / 25.4;
export const ptToMm = (pt: number) => (pt * 25.4) / 72;
export const mmToPt = (mm: number) => (mm * 72) / 25.4;
export const a4AspectRatio = () => A4_WIDTH_MM / A4_HEIGHT_MM;
export const isA4Aspect = (w: number, h: number, eps = 0.02) => Math.abs(w / h - a4AspectRatio()) < eps;
export const safeMarginMm = (side: 'inner' | 'outer') => (side === 'inner' ? 18 : 15);
export const safeMarginPt = (side: 'inner' | 'outer') => mmToPt(safeMarginMm(side));
export const bleedMm = 3;
export const bleedPt = () => mmToPt(bleedMm);
export const slugAreaPt = () => 12;
export const foldMarksOffsetMm = 105;
export const cropMarkLengthMm = 3;
export const defaultResumeDpi = 72;
export const printDpi = 300;
export const pxAtPrintDpi = (mm: number) => (mm / 25.4) * printDpi;
export const pageCountEstimate = (contentHeightPt: number) => Math.max(1, Math.ceil(contentHeightPt / A4_HEIGHT_PT));
export const contentWidthPt = (marginLR: number) => A4_WIDTH_PT - 2 * marginLR;
export const contentHeightPt = (marginTB: number) => A4_HEIGHT_PT - 2 * marginTB;
export const footerReservePt = 40;
export const headerReservePt = 56;
export const columnSplitRatio = (left: number) => clamp01(left);
export const twoColumnGapPt = 16;
export const baselineGridPt = 3.5;
export const snapToBaseline = (y: number, grid = baselineGridPt) => Math.round(y / grid) * grid;
export const lineHeightForBody = (fontPt: number) => fontPt * 1.35;
export const sectionGapPt = (density: 'tight' | 'normal' | 'airy') =>
  density === 'tight' ? 8 : density === 'airy' ? 18 : 12;
export const orphanLineThreshold = 2;
export const widowLineThreshold = 2;
export const hyphenationLocaleDefault = 'en';
export const tabStopPt = 24;
export const hangingIndentPt = 12;
export const bulletIndentPt = 14;
export const ruleWidthHairline = 0.25;
export const ruleWidthNormal = 0.75;
export const ruleWidthEmphasis = 1.25;
export const rgbFromHex = (hex: string) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return { r: 15, g: 23, b: 42 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};
export const contrastOnWhite = (hex: string) => {
  const { r, g, b } = rgbFromHex(hex);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.6 ? '#0f172a' : '#f8fafc';
};
export const paperLabel = () => `ISO A4 (${A4_WIDTH_MM}×${A4_HEIGHT_MM} mm)`;
export const pdfMetadataTitle = (name: string) => `Resume — ${name}`.slice(0, 200);
export const embedSubsetFontsHint = () => true;
export const pdfUaHint = () => 'tagged structure optional';
export const iccProfileHint = () => 'sRGB IEC61966-2.1';
export const exportFilename = (slug: string) => `${slug.replace(/[^\w.-]+/g, '-').slice(0, 80) || 'resume'}.pdf`;
