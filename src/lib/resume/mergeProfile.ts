import type { ResumeDocumentV1 } from './types';
import { normalizeResume } from './engine';

export type ProfileForResumeMerge = {
  fullName?: string;
  headline?: string;
  bio?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  skills?: string;
};

function normUrl(s: string): string {
  const t = s.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  if (t.includes('linkedin.com')) return `https://${t.replace(/^\/+/, '')}`;
  if (t.includes('instagram.com') || t.startsWith('@')) {
    const h = t.startsWith('@') ? t.slice(1) : t;
    if (h && !h.includes('/')) return `https://instagram.com/${h}`;
    return `https://${h.replace(/^\/+/, '')}`;
  }
  return t.startsWith('//') ? `https:${t}` : `https://${t}`;
}

/**
 * Fills empty resume fields from profile data (non-destructive: does not overwrite user-edited resume text).
 */
export function mergeProfileIntoResume(
  doc: ResumeDocumentV1,
  p: ProfileForResumeMerge
): ResumeDocumentV1 {
  const next = { ...doc, social: { ...doc.social } };

  if (!next.fullName?.trim() && p.fullName?.trim()) next.fullName = p.fullName.trim();
  if (!next.headline?.trim() && p.headline?.trim()) next.headline = p.headline.trim();
  if (!next.summary?.trim() && p.bio?.trim()) next.summary = p.bio.trim();

  const li = p.linkedin?.trim();
  if (li && !next.social.linkedin?.trim()) next.social.linkedin = normUrl(li);

  const web = p.website?.trim();
  if (web && !next.social.portfolio?.trim()) next.social.portfolio = normUrl(web);

  const ig = p.instagram?.trim();
  if (ig && !next.social.other?.trim()) {
    const u = ig.startsWith('@') ? `https://instagram.com/${ig.slice(1)}` : normUrl(ig);
    next.social.other = u.includes('instagram') ? u : `https://instagram.com/${ig.replace(/^@/, '')}`;
  }

  const edu = p.education?.trim();
  if (edu && next.education.length === 0) {
    next.education = [
      {
        id: `profile-edu-${Date.now()}`,
        school: edu.slice(0, 200),
        degree: '',
        field: '',
        start: '',
        end: '',
        details: '',
        extras: '',
      },
    ];
  }

  const sk = p.skills?.trim();
  if (sk && next.skillGroups.length === 0) {
    const items = sk
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
    if (items.length) {
      next.skillGroups = [{ id: `profile-sk-${Date.now()}`, label: 'Skills', items }];
    }
  }

  return normalizeResume(next);
}
