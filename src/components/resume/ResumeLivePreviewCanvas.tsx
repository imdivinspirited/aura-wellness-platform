/**
 * Full-width scrollable canvas preview: drag sections & roles, click to edit, hide sections (X).
 * Used when the compose editor is hidden (focus mode).
 */

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { PAGE_SIZE_PRESETS, pageSizeLabel } from '@/lib/resume/pageSpec';
import { mergeCanvasSectionOrder, reorderCanvasSections, isCanvasSectionVisible } from '@/lib/resume/canvasSectionOrder';
import type { CanvasResizeAnchor, VisualScale2D } from '@/lib/resume/types';
import { normalizeVisualScale } from '@/lib/resume/visualScale2d';
import { withVisibility } from '@/lib/resume/primitives/document';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ResumePreviewCanvasExperience } from '@/components/resume/ResumePreviewCanvasExperience';
import { CanvasSortableSection } from '@/components/resume/CanvasSortableSection';
import type { CanvasListEditMode } from '@/components/resume/CanvasListSectionEditors';
import {
  CanvasCertificationsBody,
  CanvasCustomSectionsBody,
  CanvasEducationBody,
  CanvasLanguagesBody,
  CanvasProjectsBody,
  CanvasSkillsBody,
} from '@/components/resume/CanvasListSectionEditors';

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

const SECTION_TO_VIS: Partial<Record<string, keyof ResumeDocumentV1['visibility']>> = {
  summary: 'summary',
  experience: 'experience',
  education: 'education',
  projects: 'projects',
  certifications: 'certifications',
  languages: 'languages',
  skills: 'skills',
  custom: 'custom',
  profileDetails: 'profileDetails',
  achievements: 'achievements',
};

export interface ResumeLivePreviewCanvasProps {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
  /** Profile fallback when doc.fullName is empty */
  displayName: string;
  contactLine: string;
  socialLine: string[];
  profileDetailLines: string[];
  achievements: Array<{ _id?: string; title: string; description?: string }>;
  hideChrome?: boolean;
  embedded?: boolean;
}

export function ResumeLivePreviewCanvas({
  doc,
  setDoc,
  displayName,
  contactLine,
  socialLine,
  profileDetailLines,
  achievements,
  hideChrome,
  embedded = false,
}: ResumeLivePreviewCanvasProps) {
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

  const [editingName, setEditingName] = useState(false);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  /** Canva-like: which block shows chrome; only one at a time. Section ids `sec-*`, role cards use experience row id. */
  const [selectedCanvasKey, setSelectedCanvasKey] = useState<string | null>(null);
  const [listSectionEditMode, setListSectionEditMode] = useState<CanvasListEditMode>(null);

  const resolvedName = useMemo(
    () => (doc.fullName && doc.fullName.trim()) || displayName,
    [doc.fullName, displayName]
  );

  const specLine = useMemo(
    () => `${pageSizeLabel(L.pageSize)} · ${pagePreset.widthMm}×${pagePreset.heightMm} mm`,
    [L.pageSize, pagePreset.heightMm, pagePreset.widthMm]
  );

  const gapClass = `space-y-[calc(${0.85 * sg}rem)]`;

  const sectionOrder = useMemo(() => mergeCanvasSectionOrder(doc.layout.sectionOrder), [doc.layout.sectionOrder]);

  const visibleSectionIds = useMemo(
    () => sectionOrder.filter((id) => isCanvasSectionVisible(doc, id)),
    [sectionOrder, doc]
  );

  const sectionSortableIds = useMemo(() => visibleSectionIds.map((id) => `sec-${id}`), [visibleSectionIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const hideSection = (sectionId: string) => {
    const vk = SECTION_TO_VIS[sectionId];
    if (vk) setDoc((d) => withVisibility(d, vk, false));
  };

  const sectionScale = (key: string) => normalizeVisualScale(doc.layout.sectionVisualScale?.[key]);
  const setSectionScale = (key: string, next: VisualScale2D) => {
    setDoc((d) => ({
      ...d,
      layout: {
        ...d.layout,
        sectionVisualScale: { ...d.layout.sectionVisualScale, [key]: next },
      },
    }));
  };

  const commitSectionResizeAnchor = useCallback((sectionId: string, edge: CanvasResizeAnchor) => {
    setDoc((d) => ({
      ...d,
      layout: {
        ...d.layout,
        sectionVisualResizeAnchor: {
          ...d.layout.sectionVisualResizeAnchor,
          [sectionId]: edge,
        },
      },
    }));
  }, [setDoc]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const aid = String(active.id);
    const oid = String(over.id);
    if (aid.startsWith('sec-') && oid.startsWith('sec-')) {
      const activeKey = aid.replace(/^sec-/, '');
      const overKey = oid.replace(/^sec-/, '');
      setDoc((d) => ({
        ...d,
        layout: { ...d.layout, sectionOrder: reorderCanvasSections(d, activeKey, overKey) },
      }));
      return;
    }
    setDoc((d) => {
      const oldIndex = d.experience.findIndex((e) => e.id === active.id);
      const newIndex = d.experience.findIndex((e) => e.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return d;
      return { ...d, experience: arrayMove(d.experience, oldIndex, newIndex) };
    });
  };

  const expIds = doc.experience.map((e) => e.id);

  const titleAlignProp = L.sectionTitleAlign === 'center' ? 'center' : 'left';

  const canvasCols = L.canvasPreviewColumns === 2 || L.canvasPreviewColumns === 3 ? L.canvasPreviewColumns : 1;
  const sectionSortStrategy = canvasCols > 1 ? rectSortingStrategy : verticalListSortingStrategy;
  const sectionGridGapRem = 0.85 * sg;

  const renderBodySection = (id: string) => {
    const onHide = () => hideSection(id);
    const vsSec = normalizeVisualScale(doc.layout.sectionVisualScale?.[id]);
    const secFont = (vsSec.x + vsSec.y) / 2;
    const bz = bodyPt * secFont;
    const sz = smallPt * secFont;
    const tz = secPt * secFont;

    switch (id) {
      case 'summary':
        if (!doc.visibility.summary) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Professional summary"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setListSectionEditMode(null);
              setEditingSummary(true);
            }}
          >
            <div className={bodyAlign}>
              {editingSummary ? (
                <div className="space-y-2">
                  <Textarea
                    autoFocus
                    rows={8}
                    value={doc.summary}
                    onChange={(e) => setDoc((d) => ({ ...d, summary: e.target.value }))}
                    className="min-h-[120px] resize-y"
                    style={{ fontSize: `${bz}pt` }}
                  />
                  <button
                    type="button"
                    className="text-xs font-medium text-primary underline"
                    onClick={() => setEditingSummary(false)}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div
                  className="w-full whitespace-pre-wrap text-left text-zinc-700 dark:text-zinc-300"
                  style={{ fontSize: `${bz}pt` }}
                >
                  {doc.summary || 'Double-click to edit summary'}
                </div>
              )}
            </div>
          </CanvasSortableSection>
        );

      case 'experience':
        if (!doc.visibility.experience) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Experience"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
          >
            <div className={bodyAlign}>
              <SortableContext items={expIds} strategy={verticalListSortingStrategy}>
                <ResumePreviewCanvasExperience
                  doc={doc}
                  setDoc={setDoc}
                  bodyPt={bodyPt}
                  smallPt={smallPt}
                  editingExpId={editingExpId}
                  setEditingExpId={setEditingExpId}
                  selectedCanvasKey={selectedCanvasKey}
                  setSelectedCanvasKey={setSelectedCanvasKey}
                />
              </SortableContext>
            </div>
          </CanvasSortableSection>
        );

      case 'education':
        if (!doc.visibility.education) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Education"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('education');
            }}
          >
            <div className={bodyAlign}>
              <CanvasEducationBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                editMode={listSectionEditMode === 'education'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'projects':
        if (!doc.visibility.projects) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Projects"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('projects');
            }}
          >
            <div className={bodyAlign}>
              <CanvasProjectsBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                editMode={listSectionEditMode === 'projects'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'certifications':
        if (!doc.visibility.certifications) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Certifications"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('certifications');
            }}
          >
            <div className={bodyAlign}>
              <CanvasCertificationsBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                editMode={listSectionEditMode === 'certifications'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'languages':
        if (!doc.visibility.languages) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Languages"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('languages');
            }}
          >
            <div className={bodyAlign}>
              <CanvasLanguagesBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                editMode={listSectionEditMode === 'languages'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'skills':
        if (!doc.visibility.skills) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Skills"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('skills');
            }}
          >
            <div className={bodyAlign}>
              <CanvasSkillsBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                editMode={listSectionEditMode === 'skills'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'custom':
        if (!doc.visibility.custom) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Custom sections"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
            onRequestTextEdit={() => {
              setEditingSummary(false);
              setListSectionEditMode('custom');
            }}
          >
            <div className={`space-y-3 ${bodyAlign}`}>
              <CanvasCustomSectionsBody
                doc={doc}
                setDoc={setDoc}
                bodyPt={bz}
                smallPt={sz}
                secPt={tz}
                accent={accent}
                secAlign={secAlign}
                editMode={listSectionEditMode === 'custom'}
                onDone={() => setListSectionEditMode(null)}
              />
            </div>
          </CanvasSortableSection>
        );

      case 'profileDetails':
        if (!doc.visibility.profileDetails) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Profile"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
          >
            <div className={bodyAlign}>
              {profileDetailLines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Details come from your profile fields.</p>
              ) : (
                <ul className="space-y-1 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${sz}pt` }}>
                  {profileDetailLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </CanvasSortableSection>
        );

      case 'achievements':
        if (!doc.visibility.achievements) return null;
        return (
          <CanvasSortableSection
            key={id}
            id={`sec-${id}`}
            visualScale={sectionScale(id)}
            onScaleChange={(s) => setSectionScale(id, s)}
            resizeAnchor={doc.layout.sectionVisualResizeAnchor?.[id]}
            onResizeAnchorCommit={(edge) => commitSectionResizeAnchor(id, edge)}
            title="Achievements"
            accent={accent}
            titleFontPt={tz}
            fontFamily={font}
            titleAlign={titleAlignProp}
            onHide={onHide}
            isSelected={selectedCanvasKey === `sec-${id}`}
            onSelectBlock={() => setSelectedCanvasKey(`sec-${id}`)}
          >
            <div className={bodyAlign}>
              {achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add achievements from the Activities tab.</p>
              ) : (
                <ul className="space-y-2" style={{ fontSize: `${bz}pt` }}>
                  {achievements.map((a) => (
                    <li key={a._id ?? a.title}>
                      <span className="font-semibold">• {a.title}</span>
                      {a.description ? (
                        <p className="pl-3 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${sz}pt` }}>
                          {a.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CanvasSortableSection>
        );

      default:
        return null;
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div
        className={cn(
          'relative z-0 flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden',
          embedded ? 'bg-background' : 'bg-muted/15'
        )}
      >
        {!hideChrome ? (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-background/95 px-2 py-2 backdrop-blur-sm sm:px-3">
            <p className="font-mono text-[10px] text-muted-foreground">
              Canvas ·{' '}
              <span className="text-foreground/85">
                click block to select · double-click body to edit · drag when selected · X hides
              </span>
            </p>
            <p className="max-w-[min(100%,14rem)] truncate font-mono text-[10px] tabular-nums text-muted-foreground">
              {specLine}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            'scrollbar-aura-subtle min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]',
            embedded &&
              hideChrome &&
              'pb-[min(10rem,calc(5rem+env(safe-area-inset-bottom,0px)))] sm:pb-20 lg:pb-[5.5rem]'
          )}
        >
          <div
            className={cn(
              'mx-auto w-full max-w-[min(100%,210mm)]',
              embedded ? 'px-2 pb-3 pt-0 sm:px-3 sm:pb-4' : 'px-2 py-3 sm:px-4 sm:py-5'
            )}
          >
            <div
              className={cn(
                'box-border flex min-w-0 flex-col rounded-md bg-[#f4f2ed] text-zinc-900 dark:bg-[#0e0e10] dark:text-zinc-100',
                embedded
                  ? 'ring-1 ring-border/50 shadow-none dark:ring-white/10'
                  : 'border border-zinc-400/20 shadow-lg dark:border-white/10'
              )}
              style={{ fontFamily: font }}
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
                className="min-w-0 overflow-hidden"
                style={{
                  margin: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
                  padding: `${pad}mm`,
                }}
              >
                <div className={cn(gapClass, 'min-w-0 break-words')} style={{ lineHeight: lh }}>
                  <div className={`relative border-b pb-3 ${headerClass}`} style={{ borderColor: `${accent}44` }}>
                    {editingName ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <Input
                          autoFocus
                          value={doc.fullName}
                          onChange={(e) => setDoc((d) => ({ ...d, fullName: e.target.value }))}
                          placeholder={displayName}
                          className="max-w-xl font-bold"
                          style={{ fontSize: `${namePt}pt` }}
                        />
                        <Button type="button" size="sm" variant="secondary" onClick={() => setEditingName(false)}>
                          Done
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                        style={{ fontSize: `${namePt}pt` }}
                        onClick={() => setEditingName(true)}
                      >
                        {resolvedName}
                      </button>
                    )}
                    {doc.visibility.headline ? (
                      <div className="relative mt-2 pr-8">
                        <button
                          type="button"
                          className="absolute right-0 top-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Hide headline"
                          onClick={() => setDoc((d) => withVisibility(d, 'headline', false))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        {editingHeadline ? (
                          <div className="space-y-2">
                            <Input
                              autoFocus
                              value={doc.headline}
                              onChange={(e) => setDoc((d) => ({ ...d, headline: e.target.value }))}
                              placeholder="Professional headline"
                              className="font-medium"
                              style={{ fontSize: `${smallPt + 1}pt` }}
                            />
                            <button
                              type="button"
                              className="text-xs font-medium text-primary underline"
                              onClick={() => setEditingHeadline(false)}
                            >
                              Done
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="mt-0 block w-full text-left font-medium text-zinc-600 dark:text-zinc-400"
                            style={{ fontSize: `${smallPt + 1}pt` }}
                            onClick={() => setEditingHeadline(true)}
                          >
                            {doc.headline || 'Click to add headline'}
                          </button>
                        )}
                      </div>
                    ) : null}
                    <p className="mt-2 text-zinc-500" style={{ fontSize: `${smallPt}pt` }}>
                      {[contactLine, ...socialLine].filter(Boolean).join('  ·  ')}
                    </p>
                  </div>

                  <SortableContext items={sectionSortableIds} strategy={sectionSortStrategy}>
                    <div
                      className={cn(
                        canvasCols > 1 ? 'grid w-full min-w-0' : gapClass,
                        canvasCols === 2 && 'grid-cols-1 sm:grid-cols-2',
                        canvasCols === 3 && 'grid-cols-1 sm:grid-cols-3'
                      )}
                      style={canvasCols > 1 ? { gap: `${sectionGridGapRem}rem` } : undefined}
                      onPointerDown={(e) => {
                        const t = e.target as HTMLElement;
                        if (t.closest('[data-canvas-block]')) return;
                        setSelectedCanvasKey(null);
                      }}
                    >
                      {visibleSectionIds.map((sid) => renderBodySection(sid))}
                    </div>
                  </SortableContext>
                </div>
              </div>
            </div>
          </div>
        </div>
        {hideChrome && embedded ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-24 pt-8 sm:pb-28"
            style={{
              background: 'linear-gradient(to top, hsl(var(--background) / 0.92) 30%, transparent)',
            }}
          >
            <p className="pointer-events-none max-w-lg rounded-full border border-border/60 bg-background/95 px-4 py-2 text-center text-[11px] leading-snug text-muted-foreground shadow-sm">
              <span className="font-medium text-foreground">Canvas:</span> click to select · double-click body to edit ·
              drag selected block · resize when selected · X hides · list sections: Add / double-click to edit on canvas
            </p>
          </div>
        ) : null}
      </div>
    </DndContext>
  );
}
