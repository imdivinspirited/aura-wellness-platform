/** Text transforms for resume content (ATS-friendly, consistent typography). */

export const trim = (s: string) => s.trim();
export const trimLines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
export const collapseWhitespace = (s: string) => s.replace(/\s+/g, ' ').trim();
export const normalizeNewlines = (s: string) => s.replace(/\r\n/g, '\n');
export const stripZeroWidth = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '');
export const stripControl = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, '');
export const toSingleSpace = (s: string) => collapseWhitespace(s);
export const capitalizeWord = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : '');
export const titleCaseWords = (s: string) =>
  s.split(/\s+/).map((w) => capitalizeWord(w)).join(' ');
export const removeDoubleHyphens = (s: string) => s.replace(/-{2,}/g, '-');
export const normalizeBullets = (s: string) => s.replace(/^\s*[•\-\*]\s*/gm, '• ');
export const stripHtmlLike = (s: string) => s.replace(/<[^>]+>/g, '');
export const encodePlainText = (s: string) => stripHtmlLike(stripControl(s));
export const truncate = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…');
export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const charCountNoSpace = (s: string) => s.replace(/\s/g, '').length;
export const lineCount = (s: string) => (s.trim() ? s.split('\n').length : 0);
export const hasUrl = (s: string) => /https?:\/\/\S+/i.test(s);
export const extractUrls = (s: string) => s.match(/https?:\/\/[^\s)]+/gi) ?? [];
export const maskEmail = (s: string) => s.replace(/(^.).*(@.*$)/, '$1***$2');
export const splitCsvSkills = (s: string) =>
  s
    .split(/[,;|]/)
    .map((x) => x.trim())
    .filter(Boolean);
export const joinSkills = (items: string[], sep = ', ') => items.filter(Boolean).join(sep);
export const dedupeCaseInsensitive = (items: string[]) => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of items) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
};
export const padSectionTitle = (s: string) => s.trim().toUpperCase();
export const ensurePeriod = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
export const stripMarkdownBold = (s: string) => s.replace(/\*\*([^*]+)\*\*/g, '$1');
export const stripMarkdownItalic = (s: string) => s.replace(/_([^_]+)_/g, '$1');
export const toAsciiFallback = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
export const isMostlyLatin = (s: string) => {
  if (!s.trim()) return true;
  const latin = s.match(/[A-Za-z]/g)?.length ?? 0;
  return latin / s.length > 0.5;
};
export const hashFingerprint = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
};

/** Stable empty paragraph placeholder for section templates */
export const emptyParagraph = () => '';
