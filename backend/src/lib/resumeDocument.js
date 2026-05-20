/**
 * Sanitize + serialize resume_document stored on user_profiles.resume_document
 * Shape matches frontend ResumeDocumentV1 (camelCase JSON).
 */
import { randomUUID as newId } from 'crypto';

const S = {
  headline: 300,
  summary: 12000,
  url: 500,
  short: 200,
  company: 200,
  title: 200,
  location: 200,
  school: 200,
  degree: 200,
  field: 200,
  bullet: 800,
  name: 200,
  issuer: 200,
  credentialId: 120,
  sectionTitle: 120,
  sectionBody: 8000,
  skill: 120,
  groupLabel: 80,
};

function str(v, max) {
  if (v === undefined || v === null) return '';
  const t = String(v);
  return t.length > max ? t.slice(0, max) : t;
}

function bool(v, d = true) {
  return typeof v === 'boolean' ? v : d;
}

function trimArr(a, maxLen, mapFn) {
  if (!Array.isArray(a)) return [];
  return a.slice(0, maxLen).map(mapFn).filter(Boolean);
}

function idOrNew(x) {
  const s = str(x, 64);
  return s || newId();
}

/**
 * @param {unknown} input
 * @returns {Record<string, unknown>}
 */
function emptyResume() {
  return {
    v: 1,
    fullName: '',
    headline: '',
    summary: '',
    social: { linkedin: '', github: '', portfolio: '', twitter: '', other: '' },
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    skillGroups: [],
    customSections: [],
    visibility: {
      headline: true,
      summary: true,
      experience: true,
      education: true,
      projects: true,
      certifications: true,
      languages: true,
      skills: true,
      custom: true,
      profileDetails: true,
      achievements: true,
      social: true,
    },
    layout: {
      template: 'classic',
      density: 'comfortable',
      showPageBreakHints: false,
      accentColor: '#0f172a',
      showPageNumbersInPdf: true,
      headerStyle: 'centered',
      ruleStyle: 'accent',
      pdfTypography: 'standard',
      pageSize: 'A4',
      marginMm: { top: 0, right: 0, bottom: 0, left: 0 },
      contentPaddingMm: 10,
      sectionGapScale: 1,
      lineHeightScale: 1.35,
      pdfFontFamily: 'Helvetica',
      fontScale: 1,
      bodyTextAlign: 'left',
      headerTextAlign: 'center',
      sectionTitleAlign: 'left',
    },
  };
}

function sanitizeHexColor(v) {
  const s = str(v, 7);
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^#[0-9A-Fa-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return '#0f172a';
}

function clampNum(v, min, max, fallback) {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const VS_MIN = 0.5;
const VS_MAX = 2;

const RESIZE_ANCHOR_KEYS = new Set(['n', 's', 'e', 'w', 'se']);

/** Canvas visual scale: legacy number or `{ x, y }`. */
function sanitizeVisualScale2d(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' || typeof v === 'string') {
    const n = Number(v);
    if (Number.isNaN(n)) return null;
    const c = Math.min(VS_MAX, Math.max(VS_MIN, n));
    return { x: c, y: c };
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const nx = Number(v.x);
    const ny = Number(v.y);
    const hasX = v.x !== undefined && v.x !== null && v.x !== '' && !Number.isNaN(nx);
    const hasY = v.y !== undefined && v.y !== null && v.y !== '' && !Number.isNaN(ny);
    if (!hasX && !hasY) return null;
    return {
      x: hasX ? Math.min(VS_MAX, Math.max(VS_MIN, nx)) : 1,
      y: hasY ? Math.min(VS_MAX, Math.max(VS_MIN, ny)) : 1,
    };
  }
  return null;
}

export function sanitizeResumeDocument(input) {
  if (!input || typeof input !== 'object') {
    return emptyResume();
  }
  const r = input;

  const socialIn = r.social && typeof r.social === 'object' ? r.social : {};
  const social = {
    linkedin: str(socialIn.linkedin, S.url),
    github: str(socialIn.github, S.url),
    portfolio: str(socialIn.portfolio, S.url),
    twitter: str(socialIn.twitter, S.url),
    other: str(socialIn.other, S.url),
  };

  const experience = trimArr(r.experience, 25, (e) => {
    if (!e || typeof e !== 'object') return null;
    const row = {
      id: idOrNew(e.id),
      company: str(e.company, S.company),
      title: str(e.title, S.title),
      location: str(e.location, S.location),
      start: str(e.start, S.short),
      end: str(e.end, S.short),
      current: !!e.current,
      summary: str(e.summary, 2000),
      bullets: trimArr(e.bullets, 35, (b) => str(b, S.bullet)).filter((x) => x.length > 0),
    };
    const bs = sanitizeVisualScale2d(e.blockScale);
    if (bs) row.blockScale = bs;
    if (e.blockResizeAnchor != null && e.blockResizeAnchor !== '') {
      const a = str(e.blockResizeAnchor, 2);
      if (RESIZE_ANCHOR_KEYS.has(a)) row.blockResizeAnchor = a;
    }
    return row;
  });

  const education = trimArr(r.education, 22, (e) => {
    if (!e || typeof e !== 'object') return null;
    return {
      id: idOrNew(e.id),
      school: str(e.school, S.school),
      degree: str(e.degree, S.degree),
      field: str(e.field, S.field),
      start: str(e.start, S.short),
      end: str(e.end, S.short),
      details: str(e.details, 2000),
      extras: str(e.extras, 1000),
    };
  });

  const projects = trimArr(r.projects, 22, (e) => {
    if (!e || typeof e !== 'object') return null;
    return {
      id: idOrNew(e.id),
      name: str(e.name, S.name),
      url: str(e.url, S.url),
      summary: str(e.summary, 2000),
      highlights: trimArr(e.highlights, 20, (b) => str(b, S.bullet)).filter((x) => x.length > 0),
    };
  });

  const certifications = trimArr(r.certifications, 35, (e) => {
    if (!e || typeof e !== 'object') return null;
    return {
      id: idOrNew(e.id),
      name: str(e.name, S.name),
      issuer: str(e.issuer, S.issuer),
      date: str(e.date, S.short),
      expiry: str(e.expiry, S.short),
      credentialId: str(e.credentialId, S.credentialId),
    };
  });

  const languages = trimArr(r.languages, 35, (e) => {
    if (!e || typeof e !== 'object') return null;
    return {
      id: idOrNew(e.id),
      name: str(e.name, S.name),
      proficiency: str(e.proficiency, S.short),
    };
  });

  const skillGroups = trimArr(r.skillGroups, 22, (g) => {
    if (!g || typeof g !== 'object') return null;
    const items = trimArr(g.items, 45, (x) => str(x, S.skill)).filter((x) => x.length > 0);
    return {
      id: idOrNew(g.id),
      label: str(g.label, S.groupLabel),
      items,
    };
  });

  const customSections = trimArr(r.customSections, 12, (e) => {
    if (!e || typeof e !== 'object') return null;
    return {
      id: idOrNew(e.id),
      title: str(e.title, S.sectionTitle),
      body: str(e.body, S.sectionBody),
    };
  });

  const visIn = r.visibility && typeof r.visibility === 'object' ? r.visibility : {};
  const visibility = {
    headline: bool(visIn.headline, true),
    summary: bool(visIn.summary, true),
    experience: bool(visIn.experience, true),
    education: bool(visIn.education, true),
    projects: bool(visIn.projects, true),
    certifications: bool(visIn.certifications, true),
    languages: bool(visIn.languages, true),
    skills: bool(visIn.skills, true),
    custom: bool(visIn.custom, true),
    profileDetails: bool(visIn.profileDetails, true),
    achievements: bool(visIn.achievements, true),
    social: bool(visIn.social, true),
  };

  const layIn = r.layout && typeof r.layout === 'object' ? r.layout : {};
  const mmIn = layIn.marginMm && typeof layIn.marginMm === 'object' ? layIn.marginMm : {};
  const SECTION_ORDER_KEYS = new Set([
    'summary',
    'experience',
    'education',
    'projects',
    'certifications',
    'languages',
    'skills',
    'custom',
    'profileDetails',
    'achievements',
  ]);
  const rawOrder = Array.isArray(layIn.sectionOrder) ? layIn.sectionOrder : [];
  const sectionOrder = [];
  const seenSo = new Set();
  for (const x of rawOrder) {
    const k = str(x, 40);
    if (SECTION_ORDER_KEYS.has(k) && !seenSo.has(k)) {
      sectionOrder.push(k);
      seenSo.add(k);
    }
  }
  for (const k of SECTION_ORDER_KEYS) {
    if (!seenSo.has(k)) sectionOrder.push(k);
  }

  const svsIn =
    layIn.sectionVisualScale && typeof layIn.sectionVisualScale === 'object' ? layIn.sectionVisualScale : {};
  const sectionVisualScale = {};
  for (const [k, v] of Object.entries(svsIn)) {
    const key = str(k, 40);
    if (!SECTION_ORDER_KEYS.has(key)) continue;
    const s2 = sanitizeVisualScale2d(v);
    if (s2) sectionVisualScale[key] = s2;
  }

  const svraIn =
    layIn.sectionVisualResizeAnchor && typeof layIn.sectionVisualResizeAnchor === 'object'
      ? layIn.sectionVisualResizeAnchor
      : {};
  const sectionVisualResizeAnchor = {};
  for (const [k, v] of Object.entries(svraIn)) {
    const key = str(k, 40);
    if (!SECTION_ORDER_KEYS.has(key)) continue;
    const a = str(v, 2);
    if (RESIZE_ANCHOR_KEYS.has(a)) sectionVisualResizeAnchor[key] = a;
  }

  const layout = {
    template: ['classic', 'compact', 'accent'].includes(String(layIn.template))
      ? layIn.template
      : 'classic',
    density: ['comfortable', 'compact'].includes(String(layIn.density)) ? layIn.density : 'comfortable',
    showPageBreakHints: !!layIn.showPageBreakHints,
    accentColor: sanitizeHexColor(layIn.accentColor),
    showPageNumbersInPdf: layIn.showPageNumbersInPdf !== false,
    headerStyle: ['centered', 'split', 'minimal'].includes(String(layIn.headerStyle))
      ? layIn.headerStyle
      : 'centered',
    ruleStyle: ['none', 'accent', 'full'].includes(String(layIn.ruleStyle)) ? layIn.ruleStyle : 'accent',
    pdfTypography: ['standard', 'large', 'compact'].includes(String(layIn.pdfTypography))
      ? layIn.pdfTypography
      : 'standard',
    pageSize: ['A4', 'LETTER', 'LEGAL', 'A3'].includes(String(layIn.pageSize)) ? layIn.pageSize : 'A4',
    marginMm: {
      top: clampNum(mmIn.top, 0, 35, 0),
      right: clampNum(mmIn.right, 0, 35, 0),
      bottom: clampNum(mmIn.bottom, 0, 40, 0),
      left: clampNum(mmIn.left, 0, 35, 0),
    },
    contentPaddingMm: clampNum(layIn.contentPaddingMm, 2, 28, 10),
    sectionGapScale: clampNum(layIn.sectionGapScale, 0.45, 2.4, 1),
    lineHeightScale: clampNum(layIn.lineHeightScale, 1, 2.4, 1.35),
    pdfFontFamily: ['Helvetica', 'Times-Roman', 'Courier'].includes(String(layIn.pdfFontFamily))
      ? layIn.pdfFontFamily
      : 'Helvetica',
    fontScale: clampNum(layIn.fontScale, 0.72, 1.5, 1),
    bodyTextAlign: ['left', 'center', 'justify'].includes(String(layIn.bodyTextAlign))
      ? layIn.bodyTextAlign
      : 'left',
    headerTextAlign: ['left', 'center', 'right'].includes(String(layIn.headerTextAlign))
      ? layIn.headerTextAlign
      : 'center',
    sectionTitleAlign: ['left', 'center'].includes(String(layIn.sectionTitleAlign))
      ? layIn.sectionTitleAlign
      : 'left',
    canvasPreviewColumns: [2, 3].includes(Number(layIn.canvasPreviewColumns))
      ? Number(layIn.canvasPreviewColumns)
      : 1,
    sectionOrder,
    ...(Object.keys(sectionVisualScale).length ? { sectionVisualScale } : {}),
    ...(Object.keys(sectionVisualResizeAnchor).length ? { sectionVisualResizeAnchor } : {}),
  };

  return {
    v: 1,
    fullName: str(r.fullName, S.name),
    headline: str(r.headline, S.headline),
    summary: str(r.summary, S.summary),
    social,
    experience,
    education,
    projects,
    certifications,
    languages,
    skillGroups,
    customSections,
    visibility,
    layout,
  };
}

/**
 * API-facing JSON (same as stored document after sanitize).
 * @param {unknown} doc
 */
export function serializeResumeDocument(doc) {
  return sanitizeResumeDocument(doc);
}
