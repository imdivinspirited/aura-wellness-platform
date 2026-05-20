/**
 * Floating controls for canvas mode — full structured layout (templates, presets, typography).
 */

import type { Dispatch, SetStateAction } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Redo2,
  Rows3,
  Sparkles,
  Type,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { LAYOUT_PRESET_OPTIONS, layoutPresetPatch, type LayoutPresetId } from '@/lib/resume/layoutPresets';

export interface ResumeCanvasDesignBarProps {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function ResumeCanvasDesignBar({
  doc,
  setDoc,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ResumeCanvasDesignBarProps) {
  const L = doc.layout;

  const patchLayout = (patch: Partial<ResumeDocumentV1['layout']>) => {
    setDoc((d) => ({ ...d, layout: { ...d.layout, ...patch } }));
  };

  const applyPreset = (id: LayoutPresetId) => {
    setDoc((d) => ({ ...d, layout: { ...d.layout, ...layoutPresetPatch(id) } }));
  };

  return (
    <div
      className={cn(
        'pointer-events-auto absolute left-1/2 z-30 max-h-[min(50vh,22rem)] w-[calc(100%-0.75rem)] max-w-4xl -translate-x-1/2 overflow-y-auto rounded-2xl border border-border/70 bg-background/95 px-2 py-2 shadow-lg backdrop-blur-md dark:border-white/[0.12] dark:bg-card/95 sm:max-h-none sm:overflow-visible sm:px-3',
        // Sit above home-indicator / thumb zone so the canvas scroll area can pad past this height
        'bottom-[calc(0.65rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]'
      )}
      role="toolbar"
      aria-label="Canvas layout & typography"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-2">
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0"
              disabled={!canUndo}
              onClick={onUndo}
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0"
              disabled={!canRedo}
              onClick={onRedo}
              title="Redo (⇧⌘Z)"
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <Select onValueChange={(v) => applyPreset(v as LayoutPresetId)}>
            <SelectTrigger className="h-9 w-[9.5rem] text-xs" aria-label="Apply layout preset">
              <SelectValue placeholder="Quick preset…" />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_PRESET_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  <span className="font-medium">{o.label}</span>
                  <span className="ml-2 text-muted-foreground">— {o.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={L.template}
            onValueChange={(v) => patchLayout({ template: v as ResumeDocumentV1['layout']['template'] })}
          >
            <SelectTrigger className="h-9 w-[6.5rem] text-xs" aria-label="Visual template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="accent">Accent</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={L.density}
            onValueChange={(v) => patchLayout({ density: v as ResumeDocumentV1['layout']['density'] })}
          >
            <SelectTrigger className="h-9 w-[8.5rem] text-xs" aria-label="Layout density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="compact">Compact density</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(L.canvasPreviewColumns === 2 || L.canvasPreviewColumns === 3 ? L.canvasPreviewColumns : 1)}
            onValueChange={(v) =>
              patchLayout({ canvasPreviewColumns: Number(v) as ResumeDocumentV1['layout']['canvasPreviewColumns'] })
            }
          >
            <SelectTrigger className="h-9 w-[9rem] text-xs" aria-label="Canvas columns">
              <Rows3 className="mr-1 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 column</SelectItem>
              <SelectItem value="2">2 columns</SelectItem>
              <SelectItem value="3">3 columns</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={L.pdfFontFamily}
            onValueChange={(v) => patchLayout({ pdfFontFamily: v as ResumeDocumentV1['layout']['pdfFontFamily'] })}
          >
            <SelectTrigger className="h-9 w-[7.5rem] text-xs" aria-label="PDF font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times-Roman">Times</SelectItem>
              <SelectItem value="Courier">Courier</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={L.ruleStyle}
            onValueChange={(v) => patchLayout({ ruleStyle: v as ResumeDocumentV1['layout']['ruleStyle'] })}
          >
            <SelectTrigger className="h-9 w-[6.5rem] text-xs" aria-label="Section rules">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Rule: none</SelectItem>
              <SelectItem value="accent">Rule: accent</SelectItem>
              <SelectItem value="full">Rule: full</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex min-w-[7rem] items-center gap-2">
            <Type className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Select
              value={L.pdfTypography}
              onValueChange={(v) => patchLayout({ pdfTypography: v as ResumeDocumentV1['layout']['pdfTypography'] })}
            >
              <SelectTrigger className="h-8 w-[7.5rem] text-xs" aria-label="Body size preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="compact">Compact type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[8rem] flex-1 items-center gap-2">
            <Label className="sr-only">Font scale</Label>
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">Scale</span>
            <Slider
              className="w-[5.5rem]"
              min={72}
              max={150}
              step={1}
              value={[Math.round((L.fontScale ?? 1) * 100)]}
              onValueChange={([v]) => patchLayout({ fontScale: (v ?? 100) / 100 })}
            />
            <span className="w-8 tabular-nums text-[10px] text-muted-foreground">{Math.round((L.fontScale ?? 1) * 100)}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(L.accentColor) ? L.accentColor : '#0f172a'}
              onChange={(e) => patchLayout({ accentColor: e.target.value })}
              className="h-8 w-10 cursor-pointer rounded-md border border-border bg-background p-0.5"
              title="Accent color"
              aria-label="Accent color"
            />
          </div>

          <div className="flex min-w-[7rem] flex-1 items-center gap-2">
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">Line</span>
            <Slider
              className="w-[4.5rem]"
              min={100}
              max={200}
              step={5}
              value={[Math.round((L.lineHeightScale ?? 1.35) * 100)]}
              onValueChange={([v]) => patchLayout({ lineHeightScale: (v ?? 135) / 100 })}
            />
          </div>

          <div className="flex min-w-[7rem] flex-1 items-center gap-2">
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">Gap</span>
            <Slider
              className="w-[4.5rem]"
              min={45}
              max={140}
              step={5}
              value={[Math.round((L.sectionGapScale ?? 1) * 100)]}
              onValueChange={([v]) => patchLayout({ sectionGapScale: (v ?? 100) / 100 })}
            />
          </div>

          <div className="flex min-w-[9rem] flex-1 items-center gap-2">
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">Pad</span>
            <Slider
              className="w-[4.5rem]"
              min={6}
              max={20}
              step={1}
              value={[L.contentPaddingMm ?? 10]}
              onValueChange={([v]) => patchLayout({ contentPaddingMm: v ?? 10 })}
            />
            <span className="w-6 tabular-nums text-[10px] text-muted-foreground">{L.contentPaddingMm ?? 10}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Body</span>
            {(
              [
                ['left', AlignLeft],
                ['center', AlignCenter],
                ['justify', AlignJustify],
              ] as const
            ).map(([val, Icon]) => (
              <Button
                key={val}
                type="button"
                size="icon"
                variant={L.bodyTextAlign === val ? 'secondary' : 'ghost'}
                className="h-8 w-8"
                onClick={() => patchLayout({ bodyTextAlign: val })}
                title={`Body ${val}`}
                aria-label={`Body align ${val}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
            {(
              [
                ['left', AlignLeft],
                ['center', AlignCenter],
                ['right', AlignRight],
              ] as const
            ).map(([val, Icon]) => (
              <Button
                key={val}
                type="button"
                size="icon"
                variant={L.headerTextAlign === val ? 'secondary' : 'ghost'}
                className="h-8 w-8"
                onClick={() => patchLayout({ headerTextAlign: val })}
                title={`Header ${val}`}
                aria-label={`Header align ${val}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Rows3 className="mr-0.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Sections</span>
            {(
              [
                ['left', AlignLeft],
                ['center', AlignCenter],
              ] as const
            ).map(([val, Icon]) => (
              <Button
                key={val}
                type="button"
                size="icon"
                variant={L.sectionTitleAlign === val ? 'secondary' : 'ghost'}
                className="h-8 w-8"
                onClick={() => patchLayout({ sectionTitleAlign: val })}
                title={`Section titles ${val}`}
                aria-label={`Section title align ${val}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
