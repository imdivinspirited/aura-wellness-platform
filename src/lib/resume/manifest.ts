/**
 * Extensibility manifest: 300 capability slots for resume engine (routing, flags, analytics).
 * Each slot is a stable id + lane + domain area for future UI / A/B / enterprise toggles.
 */
const LANES = [
  'persist',
  'pdf',
  'preview',
  'validate',
  'transform',
  'merge',
  'ats',
  'a11y',
  'i18n',
  'layout',
  'export',
  'import',
  'brand',
  'print',
  'analytics',
  'security',
  'compliance',
  'collab',
  'ai',
  'edge',
] as const;
const AREAS = [
  'header',
  'summary',
  'experience',
  'education',
  'project',
  'certification',
  'language',
  'skill',
  'custom',
  'social',
  'achievement',
  'section',
] as const;

export type ResumeFeatureLane = (typeof LANES)[number];
export type ResumeFeatureArea = (typeof AREAS)[number];

export interface ResumeFeatureDescriptor {
  id: string;
  lane: ResumeFeatureLane;
  area: ResumeFeatureArea;
  ordinal: number;
}

export const RESUME_FEATURE_MANIFEST: readonly ResumeFeatureDescriptor[] = Array.from(
  { length: 300 },
  (_, i) => ({
    id: `aura.resume.capability.v1.${String(i + 1).padStart(3, '0')}`,
    lane: LANES[i % LANES.length],
    area: AREAS[i % AREAS.length],
    ordinal: i + 1,
  })
);

export const RESUME_FEATURE_COUNT = RESUME_FEATURE_MANIFEST.length;
