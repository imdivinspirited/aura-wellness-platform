/** Tiny composable helpers (resume pipeline building blocks). */

export const identity = <T>(x: T): T => x;
export const constant =
  <T>(x: T) =>
  () =>
    x;
export const noop = () => {};
export const not = (x: boolean) => !x;
export const and = (a: boolean, b: boolean) => a && b;
export const or = (a: boolean, b: boolean) => a || b;
export const xor = (a: boolean, b: boolean) => a !== b;
export const eq = <T>(a: T, b: T) => a === b;
export const ne = <T>(a: T, b: T) => a !== b;
export const isNull = (x: unknown): x is null | undefined => x == null;
export const isDefined = <T>(x: T | null | undefined): x is T => x != null;
export const defaultTo = <T>(x: T | null | undefined, d: T) => (x == null ? d : x);
export const coalesce = <T>(...xs: (T | null | undefined)[]) => xs.find(isDefined) as T | undefined;
export const maybe = <T, U>(x: T | null | undefined, f: (v: T) => U): U | undefined =>
  x == null ? undefined : f(x);
export const tap = <T>(x: T, f: (v: T) => void): T => (f(x), x);
export const pipe = <A, B, C>(a: A, f: (x: A) => B, g: (x: B) => C) => g(f(a));
export const curry2 =
  <A, B, R>(fn: (a: A, b: B) => R) =>
  (a: A) =>
  (b: B) =>
    fn(a, b);
export const flip =
  <A, B, R>(fn: (a: A, b: B) => R) =>
  (b: B, a: A) =>
    fn(a, b);
export const debounceLead = (ms: number) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (fn: () => void) => {
    if (t) return;
    fn();
    t = setTimeout(() => {
      t = null;
    }, ms);
  };
};
export const once = <T extends (...a: unknown[]) => unknown>(fn: T) => {
  let done = false;
  return (...args: Parameters<T>) => {
    if (done) return;
    done = true;
    return fn(...args);
  };
};
export const memo1 = <A, R>(fn: (a: A) => R) => {
  let lastA: A;
  let lastR: R;
  let has = false;
  return (a: A) => {
    if (has && a === lastA) return lastR;
    lastA = a;
    lastR = fn(a);
    has = true;
    return lastR;
  };
};
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const retry = async <T>(fn: () => Promise<T>, n: number, backoffMs: number) => {
  let last: unknown;
  for (let i = 0; i < n; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i < n - 1) await delay(backoffMs * (i + 1));
    }
  }
  throw last;
};
export const tryCatch = <T, E>(fn: () => T, onErr: (e: unknown) => E): T | E => {
  try {
    return fn();
  } catch (e) {
    return onErr(e);
  }
};
export const resultOk = <T>(value: T) => ({ ok: true as const, value });
export const resultErr = <E>(error: E) => ({ ok: false as const, error });
export const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
export const keys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[];
export const values = <T extends object>(o: T) => Object.values(o);
export const entries = <T extends object>(o: T) => Object.entries(o) as [keyof T, T[keyof T]][];
export const freezeCopy = <T>(x: T): T => Object.freeze(JSON.parse(JSON.stringify(x)));
export const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
};
