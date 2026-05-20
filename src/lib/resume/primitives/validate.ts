const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_LOOSE = /^[+()\d][\d\s().-]{6,}$/;

export const isNonEmptyString = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
export const isBlank = (x: unknown) => typeof x !== 'string' || x.trim().length === 0;
export const isEmailish = (s: string) => EMAIL.test(s.trim());
export const isPhoneLoose = (s: string) => PHONE_LOOSE.test(s.trim());
export const isHttpsUrl = (s: string) => /^https:\/\//i.test(s.trim());
export const isHttpUrl = (s: string) => /^https?:\/\//i.test(s.trim());
export const hasMinLength = (s: string, n: number) => s.trim().length >= n;
export const hasMaxLength = (s: string, n: number) => s.length <= n;
export const inRangeLength = (s: string, min: number, max: number) => {
  const t = s.trim().length;
  return t >= min && t <= max;
};
export const isDigits = (s: string) => /^\d+$/.test(s);
export const isYear = (s: string) => {
  const y = parseInt(s, 10);
  return y >= 1950 && y <= 2100;
};
export const validateSummaryLength = (s: string) => {
  const w = s.trim().split(/\s+/).filter(Boolean).length;
  return w >= 40 && w <= 220;
};
export const validateHeadlineLength = (s: string) => inRangeLength(s, 8, 140);
export const validateBullet = (s: string) => inRangeLength(s, 8, 500);
export const countIssues = (flags: boolean[]) => flags.filter((x) => !x).length;
export const allTrue = (flags: boolean[]) => flags.every(Boolean);
export const anyTrue = (flags: boolean[]) => flags.some(Boolean);
export const isFiniteNumber = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
export const isUuidLike = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
export const safeJsonParse = <T>(s: string): T | null => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};
export const safeJsonStringify = (v: unknown) => {
  try {
    return JSON.stringify(v);
  } catch {
    return '';
  }
};
export const isPlainObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);
export const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every((y) => typeof y === 'string');
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]) =>
  Object.fromEntries(keys.map((k) => [k, obj[k]])) as Pick<T, K>;
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]) => {
  const s = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !s.has(k as K))) as Omit<T, K>;
};
