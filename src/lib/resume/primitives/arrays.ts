export const unique = <T>(xs: T[]) => [...new Set(xs)];
export const uniqueBy = <T, K>(xs: T[], key: (x: T) => K) => {
  const seen = new Set<K>();
  return xs.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
export const groupBy = <T, K extends string | number>(xs: T[], key: (x: T) => K) => {
  const m = new Map<K, T[]>();
  for (const x of xs) {
    const k = key(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(x);
  }
  return m;
};
export const moveIndex = <T>(xs: T[], from: number, to: number) => {
  if (from === to || from < 0 || to < 0 || from >= xs.length || to >= xs.length) return xs;
  const copy = [...xs];
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
};
export const moveUp = <T>(xs: T[], i: number) => moveIndex(xs, i, i - 1);
export const moveDown = <T>(xs: T[], i: number) => moveIndex(xs, i, i + 1);
export const insertAt = <T>(xs: T[], i: number, x: T) => [...xs.slice(0, i), x, ...xs.slice(i)];
export const removeAt = <T>(xs: T[], i: number) => xs.filter((_, j) => j !== i);
export const replaceAt = <T>(xs: T[], i: number, x: T) => xs.map((y, j) => (j === i ? x : y));
export const last = <T>(xs: T[]) => xs[xs.length - 1];
export const first = <T>(xs: T[]) => xs[0];
export const isEmpty = <T>(xs: T[]) => xs.length === 0;
export const nonEmpty = <T>(xs: T[]) => xs.length > 0;
export const take = <T>(xs: T[], n: number) => xs.slice(0, n);
export const drop = <T>(xs: T[], n: number) => xs.slice(n);
export const interleave = <T>(xs: T[], sep: T) =>
  xs.flatMap((x, i) => (i ? [sep, x] : [x]));
export const zip = <A, B>(a: A[], b: B[]) => a.map((x, i) => [x, b[i]] as const);
export const partition = <T>(xs: T[], pred: (x: T) => boolean) => {
  const t: T[] = [];
  const f: T[] = [];
  for (const x of xs) (pred(x) ? t : f).push(x);
  return [t, f] as const;
};
export const compact = <T>(xs: (T | null | undefined)[]) => xs.filter((x): x is T => x != null && x !== '');
export const flatten1 = <T>(xs: T[][]) => xs.reduce((a, b) => a.concat(b), [] as T[]);
export const countWhere = <T>(xs: T[], pred: (x: T) => boolean) => xs.reduce((n, x) => n + (pred(x) ? 1 : 0), 0);
export const maxBy = <T>(xs: T[], score: (x: T) => number) =>
  xs.reduce((best, x) => (score(x) > score(best) ? x : best), xs[0]);
export const minBy = <T>(xs: T[], score: (x: T) => number) =>
  xs.reduce((best, x) => (score(x) < score(best) ? x : best), xs[0]);
export const chunk = <T>(xs: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size));
  return out;
};
export const rotate = <T>(xs: T[], n: number) => {
  if (!xs.length) return xs;
  const k = ((n % xs.length) + xs.length) % xs.length;
  return xs.slice(k).concat(xs.slice(0, k));
};
