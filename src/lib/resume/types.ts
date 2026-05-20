/** Mirrors backend `resume_document` / ResumeDocumentV1 */

/** Canvas block scale — independent width (x) and height (y). Legacy `number` means both axes equal. */
export interface VisualScale2D {
  x: number;
  y: number;
}

export type { CanvasResizeAnchor } from './canvasResizeAnchor';

export interface ResumeSocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  other: string;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  summary: string;
  bullets: string[];
  /** Canvas/preview block zoom per axis (~0.5–2). Legacy number = uniform. */
  blockScale?: number | VisualScale2D;
  /** Last resize handle — sets which edge stays fixed when scaling. */
  blockResizeAnchor?: CanvasResizeAnchor;
}

export interface ResumeEducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  details: string;
  extras: string;
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  url: string;
  summary: string;
  highlights: string[];
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry: string;
  credentialId: string;
}

export interface ResumeLanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface ResumeSkillGroup {
  id: string;
  label: string;
  items: string[];
}

export interface ResumeCustomSection {
  id: string;
  title: string;
  body: string;
}

export interface ResumeVisibility {
  headline: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  skills: boolean;
  custom: boolean;
  profileDetails: boolean;
  achievements: boolean;
  social: boolean;
}

export interface ResumeMarginMm {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResumeLayout {
  template: 'classic' | 'compact' | 'accent';
  density: 'comfortable' | 'compact';
  /** Optional section order for canvas / future PDF (canonical ids, see `canvasSectionOrder`). */
  sectionOrder?: string[];
  showPageBreakHints: boolean;
  /** Hex accent for PDF header bar & section rules */
  accentColor: string;
  /** Footer “Page n of m · ISO A4” on exported PDF */
  showPageNumbersInPdf: boolean;
  /** Name & contact alignment in PDF */
  headerStyle: 'centered' | 'split' | 'minimal';
  /** Section underline weight / color */
  ruleStyle: 'none' | 'accent' | 'full';
  /** PDF body type scale */
  pdfTypography: 'standard' | 'large' | 'compact';
  /** Export page (PDFKit preset) */
  pageSize: 'A4' | 'LETTER' | 'LEGAL' | 'A3';
  /** Print margins in millimetres */
  marginMm: ResumeMarginMm;
  /** Inner padding inside content area (mm) */
  contentPaddingMm: number;
  /** Vertical rhythm between blocks (multiplier) */
  sectionGapScale: number;
  /** Line height multiplier for body text (preview + PDF lineGap) */
  lineHeightScale: number;
  /** Built-in PDF font */
  pdfFontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  /** Global font size multiplier */
  fontScale: number;
  bodyTextAlign: 'left' | 'center' | 'justify';
  headerTextAlign: 'left' | 'center' | 'right';
  sectionTitleAlign: 'left' | 'center';
  /** Per body-section visual scale on canvas (summary, experience, …). PDF export may not mirror exactly. */
  sectionVisualScale?: Record<string, number | VisualScale2D>;
  /** Per-section fixed edge for canvas scale (from last resize handle). */
  sectionVisualResizeAnchor?: Record<string, CanvasResizeAnchor>;
  /** Canvas preview: how many section blocks per row (PDF export stays single column). */
  canvasPreviewColumns?: 1 | 2 | 3;
}

export interface ResumeDocumentV1 {
  v: 1;
  /** Display name on resume; empty → profile name is used in UI/PDF. */
  fullName: string;
  headline: string;
  summary: string;
  social: ResumeSocialLinks;
  experience: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  projects: ResumeProjectItem[];
  certifications: ResumeCertificationItem[];
  languages: ResumeLanguageItem[];
  skillGroups: ResumeSkillGroup[];
  customSections: ResumeCustomSection[];
  visibility: ResumeVisibility;
  layout: ResumeLayout;
}
