import type {
  ResumeCertificationItem,
  ResumeCustomSection,
  ResumeDocumentV1,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeLanguageItem,
  ResumeProjectItem,
  ResumeSkillGroup,
} from '../types';
import { emptyResume } from '../emptyResume';
import { collapseWhitespace, wordCount } from './strings';
import { describeTenure } from './dates';

export const cloneResume = (r: ResumeDocumentV1): ResumeDocumentV1 => JSON.parse(JSON.stringify(r));

export const mergeResumePatch = (base: ResumeDocumentV1, patch: Partial<ResumeDocumentV1>): ResumeDocumentV1 => ({
  ...base,
  ...patch,
  social: { ...base.social, ...(patch.social ?? {}) },
  visibility: { ...base.visibility, ...(patch.visibility ?? {}) },
  layout: { ...base.layout, ...(patch.layout ?? {}) },
});

export const resumeTextBlob = (r: ResumeDocumentV1) =>
  [
    r.fullName,
    r.headline,
    r.summary,
    ...r.experience.flatMap((e) => [e.title, e.company, e.summary, ...e.bullets]),
    ...r.education.flatMap((e) => [e.school, e.degree, e.field, e.details]),
    ...r.projects.flatMap((p) => [p.name, p.summary, ...p.highlights]),
    ...r.certifications.map((c) => [c.name, c.issuer].join(' ')),
    ...r.languages.map((l) => `${l.name} ${l.proficiency}`),
    ...r.skillGroups.flatMap((g) => g.items),
    ...r.customSections.map((c) => `${c.title} ${c.body}`),
  ]
    .map((x) => collapseWhitespace(String(x)))
    .filter(Boolean)
    .join('\n');

export const totalWordCount = (r: ResumeDocumentV1) => wordCount(resumeTextBlob(r));

export const experienceTenureLabels = (xs: ResumeExperienceItem[]) =>
  xs.map((e) => describeTenure(e.start, e.end, e.current));

export const countFilledSections = (r: ResumeDocumentV1) => {
  let n = 0;
  if (r.headline.trim()) n++;
  if (r.summary.trim()) n++;
  if (r.experience.length) n++;
  if (r.education.length) n++;
  if (r.projects.length) n++;
  if (r.certifications.length) n++;
  if (r.languages.length) n++;
  if (r.skillGroups.some((g) => g.items.length)) n++;
  if (r.customSections.some((c) => c.title.trim() || c.body.trim())) n++;
  return n;
};

export const completionScore01 = (r: ResumeDocumentV1) => {
  const w = totalWordCount(r);
  const sec = countFilledSections(r);
  const base = Math.min(1, w / 450) * 0.55 + Math.min(1, sec / 8) * 0.45;
  return Math.round(base * 100) / 100;
};

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ensureExperienceIds = (r: ResumeDocumentV1): ResumeDocumentV1 => ({
  ...r,
  experience: r.experience.map((e) => ({ ...e, id: e.id || newId() })),
});

export const stripEmptyBullets = (r: ResumeDocumentV1): ResumeDocumentV1 => ({
  ...r,
  experience: r.experience.map((e) => ({ ...e, bullets: e.bullets.map((b) => b.trim()).filter(Boolean) })),
  projects: r.projects.map((p) => ({ ...p, highlights: p.highlights.map((h) => h.trim()).filter(Boolean) })),
});

export const normalizeResume = (r: ResumeDocumentV1): ResumeDocumentV1 => {
  const base = emptyResume();
  const strip = stripEmptyBullets(ensureExperienceIds(r));
  return {
    ...strip,
    layout: { ...base.layout, ...strip.layout },
  };
};

export const newExperienceItem = (): ResumeExperienceItem => ({
  id: newId(),
  company: '',
  title: '',
  location: '',
  start: '',
  end: '',
  current: false,
  summary: '',
  bullets: [],
});

export const newEducationItem = (): ResumeEducationItem => ({
  id: newId(),
  school: '',
  degree: '',
  field: '',
  start: '',
  end: '',
  details: '',
  extras: '',
});

export const newProjectItem = (): ResumeProjectItem => ({
  id: newId(),
  name: '',
  url: '',
  summary: '',
  highlights: [],
});

export const newCertificationItem = (): ResumeCertificationItem => ({
  id: newId(),
  name: '',
  issuer: '',
  date: '',
  expiry: '',
  credentialId: '',
});

export const newLanguageItem = (): ResumeLanguageItem => ({
  id: newId(),
  name: '',
  proficiency: '',
});

export const newSkillGroup = (): ResumeSkillGroup => ({
  id: newId(),
  label: '',
  items: [],
});

export const newCustomSection = (): ResumeCustomSection => ({
  id: newId(),
  title: '',
  body: '',
});

export const newResumeEntityId = () => newId();

export const mapExperience = (r: ResumeDocumentV1, fn: (e: ResumeExperienceItem) => ResumeExperienceItem) => ({
  ...r,
  experience: r.experience.map(fn),
});

export const withVisibility = (r: ResumeDocumentV1, key: keyof ResumeDocumentV1['visibility'], on: boolean) => ({
  ...r,
  visibility: { ...r.visibility, [key]: on },
});

export const toggleAllVisibility = (r: ResumeDocumentV1, on: boolean): ResumeDocumentV1 => ({
  ...r,
  visibility: Object.fromEntries(Object.keys(r.visibility).map((k) => [k, on])) as ResumeDocumentV1['visibility'],
});

export const isResumeEmpty = (r: ResumeDocumentV1) => totalWordCount(r) < 12 && countFilledSections(r) <= 1;

export const diffWordCount = (a: ResumeDocumentV1, b: ResumeDocumentV1) => totalWordCount(a) - totalWordCount(b);

export const coerceResume = (x: unknown): ResumeDocumentV1 => {
  const e = emptyResume();
  if (!x || typeof x !== 'object') return e;
  try {
    const j = JSON.parse(JSON.stringify(x)) as Partial<ResumeDocumentV1>;
    const lay = { ...e.layout, ...(j.layout || {}) };
    if (!Array.isArray(j.layout?.sectionOrder)) {
      lay.sectionOrder = e.layout.sectionOrder;
    }
    return {
      ...e,
      ...j,
      v: 1,
      fullName: typeof j.fullName === 'string' ? j.fullName : e.fullName,
      social: { ...e.social, ...(j.social || {}) },
      visibility: { ...e.visibility, ...(j.visibility || {}) },
      layout: lay,
    };
  } catch {
    return e;
  }
};
