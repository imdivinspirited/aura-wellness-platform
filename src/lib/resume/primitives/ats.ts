import { collapseWhitespace, wordCount } from './strings';

/** Heuristic ATS / keyword signals — guidance only, not hiring advice. */

export const keywordDensity = (text: string, keyword: string) => {
  const t = collapseWhitespace(text).toLowerCase();
  const k = keyword.toLowerCase().trim();
  if (!k || !t) return 0;
  const words = t.split(/\s+/);
  const hits = words.filter((w) => w.includes(k) || k.split(/\s+/).every((p) => w.includes(p))).length;
  return words.length ? hits / words.length : 0;
};

export const listKeywords = (text: string, minLen = 4) => {
  const m = new Map<string, number>();
  for (const w of collapseWhitespace(text)
    .toLowerCase()
    .split(/\s+/)) {
    const x = w.replace(/[^a-z0-9+.#]/g, '');
    if (x.length < minLen) continue;
    m.set(x, (m.get(x) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export const topKeywords = (text: string, n = 12) => listKeywords(text).slice(0, n).map(([k]) => k);

export const hasQuantifier = (s: string) => /\d+%|\d+\s*(k|m|b|yr|yrs|mo|mos|million|thousand|\+)/i.test(s);

export const hasActionVerb = (s: string) =>
  /^(led|built|drove|owned|scaled|designed|implemented|launched|improved|reduced|increased|managed|delivered|created|developed|optimized|automated|mentored|collaborated)/i.test(
    s.trim()
  );

export const bulletStartsStrong = (s: string) => hasActionVerb(s) || hasQuantifier(s);

export const estimateAtsScore01 = (blocks: { title: string; text: string }[]) => {
  let score = 0.35;
  for (const b of blocks) {
    const w = wordCount(b.text);
    if (w > 40) score += 0.05;
    if (w > 120) score += 0.05;
    if (hasQuantifier(b.text)) score += 0.04;
    if (bulletStartsStrong(b.text)) score += 0.03;
  }
  return Math.min(1, score);
};

export const flagPassiveVoice = (s: string) => /\b(was|were|been|being)\s+\w+ed\b/i.test(s);

export const flagPronounHeavy = (s: string) => {
  const words = collapseWhitespace(s).split(/\s+/);
  if (!words.length) return false;
  const hits = words.filter((w) => /^(i|me|my|we|our|us)$/i.test(w)).length;
  return hits / words.length > 0.08;
};

export const suggestQuantify = (s: string) => !hasQuantifier(s) && wordCount(s) > 6;

export const stripStopwords = (s: string) => {
  const stop = new Set(
    'the a an and or for of to in on at by is are was were be been being as with from that this these those it its into over out'.split(' ')
  );
  return collapseWhitespace(s)
    .split(/\s+/)
    .filter((w) => !stop.has(w.toLowerCase()))
    .join(' ');
};

export const acronymDensity = (s: string) => (s.match(/\b[A-Z]{2,}\b/g) ?? []).length;

export const readabilityLongSentences = (s: string, maxWords = 32) =>
  s.split(/[.!?]+/).filter((x) => wordCount(x) > maxWords).length;

export const hasSectionKeywords = (summary: string, must: string[]) => {
  const t = summary.toLowerCase();
  return must.map((k) => t.includes(k.toLowerCase()));
};

export const overlapScore = (a: string, b: string) => {
  const sa = new Set(
    collapseWhitespace(a)
      .toLowerCase()
      .split(/\s+/)
      .filter((x) => x.length > 3)
  );
  const sb = new Set(
    collapseWhitespace(b)
      .toLowerCase()
      .split(/\s+/)
      .filter((x) => x.length > 3)
  );
  let n = 0;
  for (const x of sa) if (sb.has(x)) n++;
  return sa.size ? n / sa.size : 0;
};

export const hashSection = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16);
};

export const detectDuplicateBullets = (bullets: string[]) => {
  const seen = new Set<string>();
  const dups: number[] = [];
  bullets.forEach((b, i) => {
    const k = collapseWhitespace(b).toLowerCase();
    if (seen.has(k)) dups.push(i);
    seen.add(k);
  });
  return dups;
};

export const trimBulletWidth = (s: string, max = 120) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

export const suggestKeywordsFromJd = (jd: string, n = 15) => topKeywords(jd, n);

export const matchCoverage = (resumeText: string, keywords: string[]) => {
  const t = resumeText.toLowerCase();
  return keywords.map((k) => t.includes(k.toLowerCase()));
};

export const atsReadinessFlags = (summary: string, expBullets: string[]) => ({
  summaryWordCountOk: wordCount(summary) >= 40,
  hasMetrics: hasQuantifier(summary) || expBullets.some(hasQuantifier),
  strongBullets: expBullets.filter(bulletStartsStrong).length >= Math.max(1, Math.floor(expBullets.length * 0.4)),
});
