export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const clamp01 = (n: number) => clamp(n, 0, 1);
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const pct = (part: number, whole: number) => (whole <= 0 ? 0 : Math.round((100 * part) / whole));
export const safeDiv = (a: number, b: number, fallback = 0) => (b === 0 ? fallback : a / b);
export const approxEqual = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const maxOf = (xs: number[]) => (xs.length ? Math.max(...xs) : 0);
export const minOf = (xs: number[]) => (xs.length ? Math.min(...xs) : 0);
export const toFinite = (n: unknown, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};
export const parseInt10 = (s: string, fb = 0) => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fb;
};
export const formatCompact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const isEvenInt = (n: number) => Math.floor(n) % 2 === 0;
