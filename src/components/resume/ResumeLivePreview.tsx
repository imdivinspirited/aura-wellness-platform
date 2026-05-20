/**
 * Live resume preview — mirrors PDF layout; premium document chrome.
 * Scales the full document to fit the proof well (no inner scrollbars).
 * `mode="canvas"` delegates to scrollable, interactive preview (compose hidden).
 */

import type { Dispatch, SetStateAction } from 'react';
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { PAGE_SIZE_PRESETS, pageSizeLabel } from '@/lib/resume/pageSpec';
import { ResumeLivePreviewCanvas } from '@/components/resume/ResumeLivePreviewCanvas';
import { cn } from '@/lib/utils';

function cssFontFamily(pdfFont: string) {
  if (pdfFont === 'Times-Roman') return '"Times New Roman", Times, serif';
  if (pdfFont === 'Courier') return 'ui-monospace, "Courier New", Courier, monospace';
  return 'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif';
}

function typoBase(ptKey: 'standard' | 'large' | 'compact') {
  if (ptKey === 'large') return { name: 22, body: 10.5, small: 8.5, section: 11 };
  if (ptKey === 'compact') return { name: 17, body: 9, small: 7.5, section: 9.5 };
  return { name: 20, body: 10, small: 8, section: 10.5 };
}

export interface ResumeLivePreviewProps {
  doc: ResumeDocumentV1;
  displayName: string;
  contactLine: string;
  socialLine: string[];
  profileDetailLines: string[];
  achievements: Array<{ _id?: string; title: string; description?: string }>;
  /** Split view: scaled fit. Fullscreen: scrollable canvas with drag + inline edit. */
  mode?: 'fit' | 'canvas';
  setDoc?: Dispatch<SetStateAction<ResumeDocumentV1>>;
  /** Hide the Proof / canvas hint bar (parent may show its own toolbar). */
  hideChrome?: boolean;
  /** Single-surface preview: no extra inset panel look; lighter paper chrome. */
  embedded?: boolean;
}

function ResumeLivePreviewInner({
  doc,
  displayName,
  contactLine,
  socialLine,
  profileDetailLines,
  achievements,
  mode = 'fit',
  setDoc,
  hideChrome = false,
  embedded = false,
}: ResumeLivePreviewProps) {
  const L = doc.layout;
  const pagePreset = PAGE_SIZE_PRESETS[L.pageSize] ?? PAGE_SIZE_PRESETS.A4;
  const accent = L.accentColor || '#0f172a';
  const m = L.marginMm;
  const pad = L.contentPaddingMm ?? 10;
  const fs = L.fontScale ?? 1;
  const sg = L.sectionGapScale ?? 1;
  const lh = L.lineHeightScale ?? 1.35;
  const ty = typoBase(L.pdfTypography);
  const bodyPt = ty.body * fs;
  const smallPt = ty.small * fs;
  const namePt = ty.name * fs;
  const secPt = ty.section * fs;

  const headerClass =
    L.headerTextAlign === 'left' ? 'text-left' : L.headerTextAlign === 'right' ? 'text-right' : 'text-center';
  const bodyAlign =
    L.bodyTextAlign === 'center' ? 'text-center' : L.bodyTextAlign === 'justify' ? 'text-justify' : 'text-left';
  const secAlign = L.sectionTitleAlign === 'center' ? 'text-center' : 'text-left';

  const font = cssFontFamily(L.pdfFontFamily);

  const sectionTitle = (title: string) => (
    <h3
      className={cn('mb-2 border-b-2 pb-1 font-bold uppercase tracking-[0.18em]', secAlign)}
      style={{
        borderColor: accent,
        color: accent,
        fontSize: `${secPt}pt`,
        fontFamily: font,
      }}
    >
      {title}
    </h3>
  );

  const gapClass = `space-y-[calc(${0.85 * sg}rem)]`;

  const specLine = useMemo(() => {
    return `${pageSizeLabel(L.pageSize)} · ${pagePreset.widthMm}×${pagePreset.heightMm} mm`;
  }, [L.pageSize, pagePreset.heightMm, pagePreset.widthMm]);

  const fitRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [fitBox, setFitBox] = useState<{ s: number; pw: number; ph: number; cw: number; ch: number } | null>(null);

  const updateFitScale = useCallback(() => {
    const fitEl = fitRef.current;
    const paperEl = paperRef.current;
    if (!fitEl || !paperEl) return;
    const cs = getComputedStyle(fitEl);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const cw = Math.max(0, fitEl.clientWidth - padX);
    const ch = Math.max(0, fitEl.clientHeight - padY);
    const pw = paperEl.offsetWidth;
    const ph = paperEl.scrollHeight;
    if (pw < 2 || ph < 2 || cw < 2 || ch < 2) return;
    // Contain: full resume visible inside the well, centered; never upscale past 100%.
    const s = Math.min(cw / pw, ch / ph, 1);
    setFitBox((prev) => {
      if (prev && prev.s === s && prev.pw === pw && prev.ph === ph && prev.cw === cw && prev.ch === ch) return prev;
      return { s, pw, ph, cw, ch };
    });
  }, []);

  useLayoutEffect(() => {
    updateFitScale();
  }, [
    updateFitScale,
    doc,
    displayName,
    contactLine,
    socialLine,
    profileDetailLines,
    achievements,
    L.pageSize,
    L.marginMm,
    L.contentPaddingMm,
    L.accentColor,
    L.showPageBreakHints,
  ]);

  useLayoutEffect(() => {
    const fitEl = fitRef.current;
    const paperEl = paperRef.current;
    if (!fitEl) return;
    const ro = new ResizeObserver(() => updateFitScale());
    ro.observe(fitEl);
    if (paperEl) ro.observe(paperEl);
    return () => ro.disconnect();
  }, [updateFitScale]);

  const paperBaseStyle = useMemo(() => ({ fontFamily: font } as const), [font]);

  if (mode === 'canvas' && setDoc) {
    return (
      <ResumeLivePreviewCanvas
        doc={doc}
        setDoc={setDoc}
        displayName={displayName}
        contactLine={contactLine}
        socialLine={socialLine}
        profileDetailLines={profileDetailLines}
        achievements={achievements}
        hideChrome={hideChrome}
        embedded={embedded}
      />
    );
  }

  return (
    <div className="relative z-0 flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      {!hideChrome ? (
        <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-sm bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.22)]"
              aria-hidden
            />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              Proof · <span className="text-foreground/80">synced</span>
            </span>
          </div>
          <p className="max-w-[100%] truncate font-mono text-[10px] tabular-nums text-muted-foreground">{specLine}</p>
        </div>
      ) : null}

      {/* Full bleed: scaled page top-aligned + horizontally centered (contain — whole resume visible, no crop). */}
      <div
        ref={fitRef}
        className={cn(
          'relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          embedded ? 'bg-[#f4f2ed] dark:bg-[#0e0e10]' : 'bg-muted/25 px-1 pb-1 pt-0 dark:bg-muted/15 sm:px-2 sm:pb-2'
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            ref={paperRef}
            className={cn(
              'box-border flex min-w-0 flex-col rounded-sm',
              'bg-[#f4f2ed] text-zinc-900 dark:bg-[#0e0e10] dark:text-zinc-100',
              embedded
                ? 'shadow-none ring-0'
                : 'shadow-[0_1px_0_0_rgba(0,0,0,0.06),0_12px_32px_-8px_rgba(15,23,42,0.2)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)]',
              !fitBox && 'w-full max-w-full'
            )}
            style={
              fitBox
                ? {
                    position: 'absolute',
                    left: (fitBox.cw - fitBox.pw * fitBox.s) / 2,
                    top: 0,
                    width: fitBox.pw,
                    transform: `scale(${fitBox.s})`,
                    transformOrigin: 'top left',
                    ...paperBaseStyle,
                  }
                : { position: 'relative', width: '100%', ...paperBaseStyle }
            }
          >
          {!embedded ? (
            <div
              className="h-1.5 w-full shrink-0 shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)]"
              style={{ backgroundColor: accent }}
            />
          ) : null}
          {L.showPageBreakHints ? (
            <div className="shrink-0 border-b border-dashed border-zinc-300/90 bg-zinc-100/80 px-2 py-1 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-500">
              Page 1 — continues in export
            </div>
          ) : null}
          <div
            className="min-w-0 shrink-0 overflow-hidden"
            style={{
              margin: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
              padding: `${pad}mm`,
            }}
          >
            <div className={cn(gapClass, 'min-w-0 break-words')} style={{ lineHeight: lh }}>
              <div className={`border-b pb-3 ${headerClass}`} style={{ borderColor: `${accent}44` }}>
                <h2
                  className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                  style={{ fontSize: `${namePt}pt` }}
                >
                  {displayName}
                </h2>
                {doc.headline && doc.visibility.headline ? (
                  <p
                    className="mt-1.5 font-medium text-zinc-600 dark:text-zinc-400"
                    style={{ fontSize: `${smallPt + 1}pt` }}
                  >
                    {doc.headline}
                  </p>
                ) : null}
                <p className="mt-2 text-zinc-500" style={{ fontSize: `${smallPt}pt` }}>
                  {[contactLine, ...socialLine].filter(Boolean).join('  ·  ')}
                </p>
              </div>

              {doc.summary && doc.visibility.summary ? (
                <section className={bodyAlign}>
                  {sectionTitle('Professional summary')}
                  <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.summary}
                  </p>
                </section>
              ) : null}

              {doc.experience.length > 0 && doc.visibility.experience ? (
                <section className={bodyAlign}>
                  {sectionTitle('Experience')}
                  <ul className="space-y-3">
                    {doc.experience.map((ex) => (
                      <li key={ex.id}>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100" style={{ fontSize: `${bodyPt}pt` }}>
                          {ex.title} {ex.company ? `— ${ex.company}` : ''}
                        </p>
                        <p className="text-zinc-500" style={{ fontSize: `${smallPt}pt` }}>
                          {[ex.start?.slice(0, 7), ex.current ? 'Present' : ex.end?.slice(0, 7), ex.location]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {ex.summary ? (
                          <p className="mt-1 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                            {ex.summary}
                          </p>
                        ) : null}
                        {ex.bullets.length > 0 ? (
                          <ul className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                            {ex.bullets.map((b, i) => (
                              <li key={i}>• {b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {doc.education.length > 0 && doc.visibility.education ? (
                <section className={bodyAlign}>
                  {sectionTitle('Education')}
                  <ul className="space-y-2" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.education.map((ed) => (
                      <li key={ed.id}>
                        <span className="font-semibold">{[ed.degree, ed.field].filter(Boolean).join(' — ') || ed.school}</span>
                        <span className="text-zinc-500"> — {ed.school}</span>
                        {ed.details ? (
                          <p className="mt-0.5 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                            {ed.details}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {doc.projects.length > 0 && doc.visibility.projects ? (
                <section className={bodyAlign}>
                  {sectionTitle('Projects')}
                  <ul className="space-y-2" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.projects.map((p) => (
                      <li key={p.id}>
                        <span className="font-semibold">{p.name}</span>
                        {p.url ? (
                          <span className="block text-blue-600 dark:text-blue-400" style={{ fontSize: `${smallPt}pt` }}>
                            {p.url}
                          </span>
                        ) : null}
                        {p.summary ? <p style={{ fontSize: `${smallPt}pt` }}>{p.summary}</p> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {doc.certifications.length > 0 && doc.visibility.certifications ? (
                <section className={bodyAlign}>
                  {sectionTitle('Certifications')}
                  <ul className="space-y-1" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.certifications.map((c) => (
                      <li key={c.id}>
                        {c.name} <span className="text-zinc-500">— {c.issuer}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {doc.languages.length > 0 && doc.visibility.languages ? (
                <section className={bodyAlign}>
                  {sectionTitle('Languages')}
                  <p className="text-zinc-700 dark:text-zinc-300" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}
                  </p>
                </section>
              ) : null}

              {doc.skillGroups.some((g) => g.items.length) && doc.visibility.skills ? (
                <section className={bodyAlign}>
                  {sectionTitle('Skills')}
                  <div className="space-y-1 text-zinc-700 dark:text-zinc-300" style={{ fontSize: `${bodyPt}pt` }}>
                    {doc.skillGroups.map((g) =>
                      g.items.length ? (
                        <p key={g.id}>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{g.label}: </span>
                          {g.items.join(', ')}
                        </p>
                      ) : null
                    )}
                  </div>
                </section>
              ) : null}

              {doc.customSections.length > 0 && doc.visibility.custom ? (
                <section className={`space-y-3 ${bodyAlign}`}>
                  {doc.customSections.map((cs) =>
                    cs.title || cs.body ? (
                      <div key={cs.id}>
                        <h3
                          className={cn('mb-1 border-b-2 pb-1 font-bold uppercase tracking-[0.15em]', secAlign)}
                          style={{ borderColor: accent, color: accent, fontSize: `${secPt}pt` }}
                        >
                          {cs.title || 'Section'}
                        </h3>
                        <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                          {cs.body}
                        </p>
                      </div>
                    ) : null
                  )}
                </section>
              ) : null}

              {profileDetailLines.length > 0 && doc.visibility.profileDetails ? (
                <section className={bodyAlign}>
                  {sectionTitle('Profile')}
                  <ul className="space-y-1 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                    {profileDetailLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {achievements.length > 0 && doc.visibility.achievements ? (
                <section className={bodyAlign}>
                  {sectionTitle('Achievements')}
                  <ul className="space-y-2" style={{ fontSize: `${bodyPt}pt` }}>
                    {achievements.map((a) => (
                      <li key={a._id ?? a.title}>
                        <span className="font-semibold">• {a.title}</span>
                        {a.description ? (
                          <p className="pl-3 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                            {a.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ResumeLivePreviewInner.displayName = 'ResumeLivePreview';
export const ResumeLivePreview = memo(ResumeLivePreviewInner);
