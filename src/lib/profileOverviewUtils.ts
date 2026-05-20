/**
 * Shared helpers for Profile Overview (location dedupe + lightweight completeness score).
 * Completeness is client-only UX — not used for authorization.
 */

/**
 * India PIN autofill sets `addressLine` to "Post office, District, State, Pincode" while also
 * filling city/state/pincode — showing both repeats the same locality in Overview.
 */
export function structuredLocationRedundantWithAddressLine(
  addressLine: string,
  city: string,
  state: string,
  pincode: string,
): boolean {
  const a = addressLine.trim().toLowerCase();
  const c = city.trim();
  const st = state.trim();
  const pin = pincode.replace(/\s/g, '');
  if (!a || !pin || !c || !st) return false;
  const compact = a.replace(/\s/g, '');
  if (!compact.includes(pin)) return false;
  if (!a.includes(c.toLowerCase())) return false;
  if (!a.includes(st.toLowerCase())) return false;
  return true;
}

export type ProfileCompletenessInput = {
  name: string;
  email: string;
  headline: string;
  bio: string;
  phoneNational: string;
  whatsappNational: string;
  city: string;
  state: string;
  country: string;
  addressLine: string;
  pincode: string;
  gender: string;
  education: string;
  skills: string;
  instagram: string;
  linkedin: string;
  website: string;
};

const WEIGHTS: Array<{ key: keyof ProfileCompletenessInput; weight: number }> = [
  { key: 'name', weight: 1 },
  { key: 'email', weight: 1 },
  { key: 'headline', weight: 1 },
  { key: 'bio', weight: 1 },
  { key: 'phoneNational', weight: 1 },
  { key: 'whatsappNational', weight: 0.5 },
  { key: 'city', weight: 0.5 },
  { key: 'state', weight: 0.5 },
  { key: 'country', weight: 0.5 },
  { key: 'addressLine', weight: 0.5 },
  { key: 'pincode', weight: 0.5 },
  { key: 'gender', weight: 0.5 },
  { key: 'education', weight: 0.5 },
  { key: 'skills', weight: 0.5 },
  { key: 'instagram', weight: 0.35 },
  { key: 'linkedin', weight: 0.35 },
  { key: 'website', weight: 0.35 },
];

/** Human-readable labels and tips for strength analysis UI. */
export const PROFILE_FIELD_META: Record<
  keyof ProfileCompletenessInput,
  { label: string; group: string; tip: string }
> = {
  name: { label: 'Display name', group: 'Identity', tip: 'Use the name people know you by.' },
  email: { label: 'Email', group: 'Identity', tip: 'Required for account and contact.' },
  headline: { label: 'Headline', group: 'Intro', tip: 'One line: role, focus, or how you help others.' },
  bio: { label: 'Bio', group: 'Intro', tip: 'A short story builds trust and context.' },
  phoneNational: { label: 'Phone', group: 'Contact', tip: 'Makes it easy for others to reach you.' },
  whatsappNational: { label: 'WhatsApp', group: 'Contact', tip: 'Optional channel for quick messages.' },
  city: { label: 'City', group: 'Location', tip: 'Helps with locality and programs near you.' },
  state: { label: 'State / region', group: 'Location', tip: 'Completes your location context.' },
  country: { label: 'Country', group: 'Location', tip: 'Useful for international context.' },
  addressLine: { label: 'Address line', group: 'Location', tip: 'Optional detail when city alone is not enough.' },
  pincode: { label: 'PIN / ZIP', group: 'Location', tip: 'Improves accuracy for local services.' },
  gender: { label: 'Gender', group: 'Profile', tip: 'Optional; can tailor some program suggestions.' },
  education: { label: 'Education', group: 'Profile', tip: 'Adds credibility and background.' },
  skills: { label: 'Skills', group: 'Profile', tip: 'Helps others see what you bring.' },
  instagram: { label: 'Instagram', group: 'Social', tip: 'Shows more of your journey.' },
  linkedin: { label: 'LinkedIn', group: 'Social', tip: 'Professional presence and trust.' },
  website: { label: 'Website', group: 'Social', tip: 'Portfolio, blog, or business link.' },
};

export type ProfileFieldBreakdown = {
  key: keyof ProfileCompletenessInput;
  label: string;
  group: string;
  tip: string;
  weight: number;
  filled: boolean;
  /** Share of the 100% bar this field represents (same model as completeness). */
  pointsIfFilled: number;
};

export type ProfileCompletenessBreakdown = {
  totalWeight: number;
  earnedWeight: number;
  percent: number;
  fields: ProfileFieldBreakdown[];
  strong: ProfileFieldBreakdown[];
  gaps: ProfileFieldBreakdown[];
};

/** Per-field contribution and gaps — same weighting as `computeProfileCompletenessPercent`. */
export function getProfileCompletenessBreakdown(p: ProfileCompletenessInput): ProfileCompletenessBreakdown {
  let totalWeight = 0;
  let earnedWeight = 0;
  const fields: ProfileFieldBreakdown[] = [];

  for (const { key, weight } of WEIGHTS) {
    totalWeight += weight;
    const v = p[key];
    const filled = typeof v === 'string' && v.trim().length > 0;
    if (filled) earnedWeight += weight;
    const meta = PROFILE_FIELD_META[key];
    fields.push({
      key,
      label: meta.label,
      group: meta.group,
      tip: meta.tip,
      weight,
      filled,
      pointsIfFilled: 0,
    });
  }

  for (const f of fields) {
    f.pointsIfFilled = totalWeight > 0 ? Math.round((f.weight / totalWeight) * 1000) / 10 : 0;
  }

  const percent = totalWeight <= 0 ? 0 : Math.min(100, Math.round((earnedWeight / totalWeight) * 100));
  const strong = fields.filter((x) => x.filled).sort((a, b) => b.pointsIfFilled - a.pointsIfFilled);
  const gaps = fields.filter((x) => !x.filled).sort((a, b) => b.pointsIfFilled - a.pointsIfFilled);

  return { totalWeight, earnedWeight, percent, fields, strong, gaps };
}

/** Returns 0–100 for UI progress; O(n) over fixed field list. */
export function computeProfileCompletenessPercent(p: ProfileCompletenessInput): number {
  let earned = 0;
  let total = 0;
  for (const { key, weight } of WEIGHTS) {
    total += weight;
    const v = p[key];
    if (typeof v === 'string' && v.trim()) earned += weight;
  }
  if (total <= 0) return 0;
  return Math.min(100, Math.round((earned / total) * 100));
}

/** One actionable hint for empty states (priority order). */
export function getProfileEnhancementHint(p: ProfileCompletenessInput): string | null {
  if (!p.name.trim()) return 'Add your display name so others recognize you.';
  if (!p.bio.trim() && !p.headline.trim()) return 'Add a headline or a short bio so your profile feels complete.';
  if (!p.bio.trim()) return 'Write a short bio to tell your story.';
  if (!p.phoneNational.trim() && !p.whatsappNational.trim())
    return 'Add phone or WhatsApp for faster coordination.';
  if (!p.city.trim() && !p.addressLine.trim()) return 'Add your city or address for local context.';
  if (!p.instagram.trim() && !p.linkedin.trim() && !p.website.trim())
    return 'Link Instagram, LinkedIn, or your website to build trust.';
  if (!p.education.trim() && !p.skills.trim()) return 'List education or skills to complete your profile.';
  if (!p.gender.trim()) return 'Optional: set gender for tailored program suggestions.';
  return null;
}
