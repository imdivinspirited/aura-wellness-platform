export const parseIso = (s: string) => {
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
};

export const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);

export const formatMonthYear = (s: string) => {
  const d = parseIso(s);
  return d ? d.toLocaleString(undefined, { month: 'short', year: 'numeric' }) : s;
};

export const monthsBetween = (start: string, end: string) => {
  const a = parseIso(start);
  const b = parseIso(end);
  if (!a || !b) return 0;
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
};

export const isFutureDate = (s: string) => {
  const d = parseIso(s);
  return d ? d.getTime() > Date.now() : false;
};

export const isPastDate = (s: string) => {
  const d = parseIso(s);
  return d ? d.getTime() < Date.now() : false;
};

export const minDate = (a: string, b: string) => {
  const da = parseIso(a);
  const db = parseIso(b);
  if (!da) return b;
  if (!db) return a;
  return da < db ? a : b;
};

export const maxDate = (a: string, b: string) => {
  const da = parseIso(a);
  const db = parseIso(b);
  if (!da) return b;
  if (!db) return a;
  return da > db ? a : b;
};

export const addMonths = (iso: string, months: number) => {
  const d = parseIso(iso);
  if (!d) return iso;
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return formatIsoDate(x);
};

export const yearFromIso = (s: string) => {
  const d = parseIso(s);
  return d ? d.getFullYear() : 0;
};

export const quarterOf = (s: string) => {
  const d = parseIso(s);
  if (!d) return 0;
  return Math.floor(d.getMonth() / 3) + 1;
};

export const sameYear = (a: string, b: string) => yearFromIso(a) > 0 && yearFromIso(a) === yearFromIso(b);

export const describeTenure = (start: string, end: string, current: boolean) => {
  const a = parseIso(start);
  const b = current ? new Date() : parseIso(end);
  if (!a || !b) return '';
  const mo = Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  if (mo < 18) return `${mo} mo`;
  const y = Math.floor(mo / 12);
  const m = mo % 12;
  return m > 3 ? `${y} yr ${m} mo` : `${y} yr`;
};

export const sortIsoAsc = (xs: string[]) =>
  [...xs].sort((a, b) => {
    const da = parseIso(a)?.getTime() ?? 0;
    const db = parseIso(b)?.getTime() ?? 0;
    return da - db;
  });

export const sortIsoDesc = (xs: string[]) =>
  [...xs].sort((a, b) => {
    const da = parseIso(a)?.getTime() ?? 0;
    const db = parseIso(b)?.getTime() ?? 0;
    return db - da;
  });

export const isValidIsoDateString = (s: string) => parseIso(s) !== null;

export const coerceDateInput = (s: string) => {
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return formatIsoDate(new Date(t));
  return '';
};
