/**
 * Professional resume builder: full document model, ATS hints, live split preview, PDF/JSON export.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useResumeDocHistory } from '@/hooks/useResumeDocHistory';
import {
  Download,
  FileJson,
  FileText,
  Gauge,
  LayoutGrid,
  LayoutPanelLeft,
  Palette,
  PanelLeftClose,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ResumeLivePreview } from '@/components/resume/ResumeLivePreview';
import { ResumeCanvasDesignBar } from '@/components/resume/ResumeCanvasDesignBar';
import { ResumeStudioEditorBody } from '@/components/resume/ResumeStudioEditorBody';
import { cn } from '@/lib/utils';
import { updateMyProfile } from '@/lib/api/profile';
import { downloadMyResumePdf } from '@/lib/api/resume';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import {
  RESUME_FEATURE_COUNT,
  RESUME_ENGINE_VERSION,
  PAGE_SIZE_PRESETS,
  completionScore01,
  coerceResume,
  downloadJson,
  estimateAtsScore01,
  normalizeResume,
  pageSizeLabel,
  resumeTextBlob,
} from '@/lib/resume/engine';
import { mergeProfileIntoResume, type ProfileForResumeMerge } from '@/lib/resume/mergeProfile';

export interface ResumeStudioProps {
  /** When API is used, profile query must be loaded before we seed from server */
  profileReady: boolean;
  initialResume: unknown | null;
  displayName: string;
  displayEmail: string;
  displayPhone: string;
  displayWhatsapp: string;
  /** Profile tab details for preview (location, etc.) */
  profileDetailLines: string[];
  achievements: Array<{ _id?: string; title: string; description?: string }>;
  /** Merged into resume once on load (empty fields only) — same user’s profile only. */
  profileForResumeMerge?: ProfileForResumeMerge | null;
}

export function ResumeStudio({
  profileReady,
  initialResume,
  displayName,
  displayEmail,
  displayPhone,
  displayWhatsapp,
  profileDetailLines,
  achievements,
  profileForResumeMerge,
}: ResumeStudioProps) {
  const qc = useQueryClient();
  const seeded = useRef(false);
  const { doc, setDoc, undo, redo, canUndo, canRedo, resetHistory } = useResumeDocHistory(coerceResume(null));
  /**
   * When false: compose hidden, preview is full-width canvas with on-screen editing.
   * When true: split view, preview is read-only scaled fit (no canvas editing).
   */
  const [showCompose, setShowCompose] = useState(true);

  useEffect(() => {
    if (seeded.current) return;
    if (profileReady) {
      const base = normalizeResume(coerceResume(initialResume));
      const merged = profileForResumeMerge
        ? mergeProfileIntoResume(base, profileForResumeMerge)
        : base;
      resetHistory(merged);
      seeded.current = true;
    }
  }, [profileReady, initialResume, profileForResumeMerge, resetHistory]);

  const saveM = useMutation({
    mutationFn: async (payload: ResumeDocumentV1) => {
      const normalized = normalizeResume(payload);
      await updateMyProfile({ resume: normalized });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me', 'profile-full'] });
      toast.success('Resume saved to your profile');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save resume'),
  });

  const downloadPdfM = useMutation({
    mutationFn: async () => downloadMyResumePdf(),
    onSuccess: (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'PDF download failed'),
  });

  const completion = useMemo(() => Math.round(completionScore01(doc) * 100), [doc]);
  const ats = useMemo(() => {
    const blocks = [
      { title: 'summary', text: doc.summary },
      ...doc.experience.flatMap((e) =>
        (e.bullets.length ? e.bullets : [e.summary]).map((t) => ({ title: e.company || 'Experience', text: t }))
      ),
    ].filter((b) => b.text?.trim());
    return Math.round(estimateAtsScore01(blocks) * 100);
  }, [doc]);

  const previewHtml = useMemo(() => {
    const contact = [displayEmail, displayPhone, displayWhatsapp].filter(Boolean).join('  ·  ');
    const social = doc.visibility.social
      ? [doc.social.linkedin, doc.social.github, doc.social.portfolio, doc.social.twitter, doc.social.other]
          .map((u) => u.trim())
          .filter(Boolean)
      : [];
    return { contact, social };
  }, [doc, displayEmail, displayPhone, displayWhatsapp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const accent = doc.layout.accentColor || '#0f172a';
  const pageSpec = PAGE_SIZE_PRESETS[doc.layout.pageSize] ?? PAGE_SIZE_PRESETS.A4;
  const resolvedDisplayName = (doc.fullName && doc.fullName.trim()) || displayName;

  return (
    <div className="relative z-0 flex h-full min-h-0 flex-col gap-2 overflow-hidden sm:gap-3">
      {/* Subtle register lines — stays behind content, no blur stacks */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:opacity-25"
        aria-hidden
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 11px,
            hsl(var(--border) / 0.35) 11px,
            hsl(var(--border) / 0.35) 12px
          )`,
        }}
      />

      <section className="relative z-10 shrink-0 overflow-hidden rounded-2xl border border-border/60 border-l-[5px] border-l-primary bg-card shadow-sm dark:border-white/[0.08] dark:bg-card/90">
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-background/98 via-background/92 to-muted/35 backdrop-blur-xl">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-90"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
          <CardHeader className="space-y-2 pb-2 pt-4 sm:space-y-3 sm:pt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                  <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Resume OS · v{RESUME_ENGINE_VERSION}
                </div>
                <CardTitle className="font-display text-xl tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 shadow-inner ring-1 ring-primary/15 sm:h-9 sm:w-9">
                    <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </span>
                  Studio
                </CardTitle>
                <CardDescription className="max-w-2xl text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
                  <span className="font-medium text-foreground/90">{RESUME_FEATURE_COUNT} fields</span> ·{' '}
                  <span className="font-medium text-foreground">{pageSizeLabel(doc.layout.pageSize)}</span> · Hide editor =
                  canvas; Show editor = split.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveM.mutate(doc)}
                  disabled={saveM.isPending}
                  className="h-10 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 font-semibold shadow-md shadow-primary/25 transition hover:brightness-105"
                >
                  <Save className="h-4 w-4" />
                  {saveM.isPending ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadPdfM.mutate()}
                  disabled={downloadPdfM.isPending}
                  className="h-10 gap-2 rounded-xl border-border/60 bg-muted/60 font-medium"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadJson(doc)}
                  className="h-10 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <FileJson className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 sm:space-y-4 sm:pb-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-background/80 to-muted/30 p-3 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.04] sm:rounded-2xl sm:p-4">
                <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-[11px]">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  Completion
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={completion} className="h-2.5 flex-1 bg-muted/80 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-emerald-400" />
                  <span className="text-lg font-semibold tabular-nums text-foreground">{completion}%</span>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-gradient-to-br from-background/80 to-muted/30 p-3 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.04] sm:rounded-2xl sm:p-4">
                <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mb-2 sm:text-[11px]">
                  <FileText className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                  Keyword signal
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={ats} className="h-2.5 flex-1 bg-muted/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-primary" />
                  <span className="text-lg font-semibold tabular-nums text-foreground">{ats}%</span>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 p-3 sm:rounded-2xl sm:p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-lg border-0 bg-foreground/10 px-2.5 py-0.5 font-mono text-xs font-normal">
                    {resumeTextBlob(doc).split(/\s+/).filter(Boolean).length} words
                  </Badge>
                  <Badge variant="outline" className="gap-1 rounded-lg border-border/60">
                    <LayoutGrid className="h-3 w-3 opacity-70" />
                    {doc.layout.template}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="rounded-lg border-emerald-500/35 bg-emerald-500/[0.08] font-medium text-emerald-950 dark:text-emerald-100"
              >
                {pageSpec.label} {pageSpec.widthMm}×{pageSpec.heightMm} mm
              </Badge>
              <Badge variant="outline" className="gap-1.5 rounded-lg border-violet-500/30">
                <Palette className="h-3 w-3" style={{ color: accent }} />
                Accent
              </Badge>
              <Badge variant="outline" className="rounded-lg">
                {doc.layout.showPageNumbersInPdf !== false ? 'Footers on' : 'No footers'}
              </Badge>
              <Badge variant="outline" className="rounded-lg font-mono text-[11px]">
                {doc.layout.pdfTypography} · {doc.layout.pdfFontFamily}
              </Badge>
            </div>
          </CardContent>
        </div>
      </section>

      {/* Workspace card: fills remaining tab height; scroll only inside editor/preview panes */}
      <div className="relative z-0 flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm dark:border-white/[0.08] dark:bg-card/85">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              {showCompose ? (
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px] sm:tracking-[0.22em]">
                  <span className="text-foreground/90">Compose</span>
                  <span className="mx-1.5 text-border sm:mx-2">|</span>
                  <span>Preview</span>
                </span>
              ) : (
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
                  <span className="text-foreground/90">Preview</span>
                  <span className="ml-2 text-[9px] font-normal normal-case tracking-normal text-muted-foreground">
                    · full canvas
                  </span>
                </span>
              )}
              <Badge variant="outline" className="hidden shrink-0 font-mono text-[10px] sm:inline-flex">
                {pageSpec.label} {pageSpec.widthMm}×{pageSpec.heightMm} mm
              </Badge>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 shrink-0 gap-2 rounded-lg px-3 text-xs font-medium"
              onClick={() => setShowCompose((v) => !v)}
            >
              {showCompose ? (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  Hide editor
                </>
              ) : (
                <>
                  <LayoutPanelLeft className="h-4 w-4" />
                  Show editor
                </>
              )}
            </Button>
          </div>
          {showCompose ? (
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full min-h-0 min-w-0 flex-1"
              autoSaveId="aura-resume-studio-split-h-50"
            >
              <ResizablePanel
                defaultSize={50}
                minSize={22}
                className="relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden"
              >
                {/* Isolate scroll: wheel / touch does not chain to page or preview column */}
                <div
                  onWheel={(e) => e.stopPropagation()}
                  className={cn(
                    'min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable]',
                    'p-2 pr-1 pb-2 sm:p-3 sm:pr-2 sm:pb-3 md:px-5 md:pt-5 md:pb-4 md:pr-4',
                    '[&_input]:rounded-xl [&_input]:border-border/55 [&_input]:shadow-sm [&_input]:transition-all',
                    '[&_input]:focus-visible:border-primary/40 [&_input]:focus-visible:ring-2 [&_input]:focus-visible:ring-primary/20',
                    '[&_textarea]:rounded-xl [&_textarea]:border-border/55 [&_textarea]:shadow-sm [&_textarea]:transition-all',
                    '[&_textarea]:focus-visible:border-primary/40 [&_textarea]:focus-visible:ring-2 [&_textarea]:focus-visible:ring-primary/20',
                    '[&_select]:rounded-xl [&_select]:border-border/55 [&_select]:bg-background/90 [&_select]:shadow-sm'
                  )}
                >
                  <div className="space-y-6">
                    <ResumeStudioEditorBody doc={doc} setDoc={setDoc} />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="relative z-20 w-2.5 shrink-0 bg-gradient-to-b from-border/50 via-primary/20 to-border/50 sm:w-3"
              />
              <ResizablePanel
                defaultSize={50}
                minSize={22}
                className="relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden bg-background"
              >
                <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden overscroll-none">
                  <ResumeLivePreview
                    mode="fit"
                    hideChrome
                    embedded
                    doc={doc}
                    displayName={resolvedDisplayName}
                    contactLine={previewHtml.contact}
                    socialLine={previewHtml.social}
                    profileDetailLines={profileDetailLines}
                    achievements={achievements}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
              <ResumeLivePreview
                mode="canvas"
                setDoc={setDoc}
                hideChrome
                embedded
                doc={doc}
                displayName={resolvedDisplayName}
                contactLine={previewHtml.contact}
                socialLine={previewHtml.social}
                profileDetailLines={profileDetailLines}
                achievements={achievements}
              />
              <ResumeCanvasDesignBar
                doc={doc}
                setDoc={setDoc}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
