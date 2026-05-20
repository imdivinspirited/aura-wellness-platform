/**
 * Print & layout controls — lives in Compose; Proof shows live preview only.
 */

import type { Dispatch, SetStateAction } from 'react';
import { LayoutGrid, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { PAGE_SIZE_PRESETS } from '@/lib/resume/engine';

const ACC_ITEM =
  'overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card/90 to-muted/20 px-1 shadow-sm';
const ACC_TRIGGER =
  'py-3 text-left text-sm font-semibold hover:no-underline data-[state=open]:text-primary';

function marginMmSlider(
  label: string,
  value: number,
  onChange: (v: number) => void,
  min = 0,
  max = 35
) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{value} mm</span>
      </div>
      <Slider min={min} max={max} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function scaleSlider(
  label: string,
  value: number,
  onChange: (v: number) => void,
  min: number,
  max: number,
  step: number,
  fmt: (v: number) => string
) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">{fmt(value)}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

export interface ResumeStudioProofControlsProps {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
}

export function ResumeStudioProofControls({ doc, setDoc }: ResumeStudioProofControlsProps) {
  return (
    <Accordion type="multiple" defaultValue={['page', 'type', 'theme']} className="space-y-2">
      <AccordionItem value="page" className={cn(ACC_ITEM, 'border-primary/20')}>
        <AccordionTrigger className={ACC_TRIGGER}>
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 shrink-0 text-primary" />
            Page & margins
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Page size and margins apply to the live preview and to the exported PDF.
          </p>
          <div className="space-y-3 rounded-lg border border-border/40 bg-background/60 p-3">
            <Label>Page size</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={doc.layout.pageSize}
              onChange={(e) =>
                setDoc({
                  ...doc,
                  layout: { ...doc.layout, pageSize: e.target.value as ResumeDocumentV1['layout']['pageSize'] },
                })
              }
            >
              {(['A4', 'LETTER', 'LEGAL', 'A3'] as const).map((k) => {
                const p = PAGE_SIZE_PRESETS[k];
                return (
                  <option key={k} value={k}>
                    {p.label} ({p.widthMm}×{p.heightMm} mm)
                  </option>
                );
              })}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              {marginMmSlider('Margin top', doc.layout.marginMm.top, (v) =>
                setDoc({ ...doc, layout: { ...doc.layout, marginMm: { ...doc.layout.marginMm, top: v } } })
              )}
              {marginMmSlider('Margin right', doc.layout.marginMm.right, (v) =>
                setDoc({ ...doc, layout: { ...doc.layout, marginMm: { ...doc.layout.marginMm, right: v } } })
              )}
              {marginMmSlider('Margin bottom', doc.layout.marginMm.bottom, (v) =>
                setDoc({ ...doc, layout: { ...doc.layout, marginMm: { ...doc.layout.marginMm, bottom: v } } })
              )}
              {marginMmSlider('Margin left', doc.layout.marginMm.left, (v) =>
                setDoc({ ...doc, layout: { ...doc.layout, marginMm: { ...doc.layout.marginMm, left: v } } })
              )}
            </div>
            {scaleSlider(
              'Inner padding (content)',
              doc.layout.contentPaddingMm ?? 10,
              (v) => setDoc({ ...doc, layout: { ...doc.layout, contentPaddingMm: v } }),
              2,
              28,
              1,
              (v) => `${v} mm`
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="type" className={ACC_ITEM}>
        <AccordionTrigger className={ACC_TRIGGER}>Typography & alignment</AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-3 rounded-lg border border-border/40 bg-background/60 p-3">
            <Label>PDF font</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={doc.layout.pdfFontFamily}
              onChange={(e) =>
                setDoc({
                  ...doc,
                  layout: {
                    ...doc.layout,
                    pdfFontFamily: e.target.value as ResumeDocumentV1['layout']['pdfFontFamily'],
                  },
                })
              }
            >
              <option value="Helvetica">Helvetica (sans)</option>
              <option value="Times-Roman">Times (serif)</option>
              <option value="Courier">Courier (mono)</option>
            </select>
            {scaleSlider(
              'Font scale',
              doc.layout.fontScale ?? 1,
              (v) => setDoc({ ...doc, layout: { ...doc.layout, fontScale: v } }),
              0.82,
              1.28,
              0.02,
              (v) => `${v.toFixed(2)}×`
            )}
            {scaleSlider(
              'Section gap',
              doc.layout.sectionGapScale ?? 1,
              (v) => setDoc({ ...doc, layout: { ...doc.layout, sectionGapScale: v } }),
              0.65,
              1.45,
              0.05,
              (v) => `${v.toFixed(2)}×`
            )}
            {scaleSlider(
              'Line height',
              doc.layout.lineHeightScale ?? 1.35,
              (v) => setDoc({ ...doc, layout: { ...doc.layout, lineHeightScale: v } }),
              1.1,
              1.85,
              0.05,
              (v) => `${v.toFixed(2)}×`
            )}
            <div className="space-y-2 pt-1">
              <Label>PDF body size preset</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={doc.layout.pdfTypography}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    layout: {
                      ...doc.layout,
                      pdfTypography: e.target.value as ResumeDocumentV1['layout']['pdfTypography'],
                    },
                  })
                }
              >
                <option value="standard">Standard (10 pt body)</option>
                <option value="large">Large (accessibility)</option>
                <option value="compact">Compact (fit more)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Vertical density</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={doc.layout.density}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    layout: { ...doc.layout, density: e.target.value as ResumeDocumentV1['layout']['density'] },
                  })
                }
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Tight</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Body text</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                  value={doc.layout.bodyTextAlign}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      layout: {
                        ...doc.layout,
                        bodyTextAlign: e.target.value as ResumeDocumentV1['layout']['bodyTextAlign'],
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Name & contact</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                  value={doc.layout.headerTextAlign}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      layout: {
                        ...doc.layout,
                        headerTextAlign: e.target.value as ResumeDocumentV1['layout']['headerTextAlign'],
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Section titles</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                  value={doc.layout.sectionTitleAlign}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      layout: {
                        ...doc.layout,
                        sectionTitleAlign: e.target.value as ResumeDocumentV1['layout']['sectionTitleAlign'],
                      },
                    })
                  }
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="theme" className={ACC_ITEM}>
        <AccordionTrigger className={ACC_TRIGGER}>
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4 shrink-0 text-primary" />
            Theme & PDF export
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5" />
                Accent color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="h-10 w-14 cursor-pointer p-1"
                  value={doc.layout.accentColor?.startsWith('#') ? doc.layout.accentColor : '#0f172a'}
                  onChange={(e) => setDoc({ ...doc, layout: { ...doc.layout, accentColor: e.target.value } })}
                />
                <Input
                  className="font-mono text-xs"
                  value={doc.layout.accentColor}
                  onChange={(e) => setDoc({ ...doc, layout: { ...doc.layout, accentColor: e.target.value } })}
                  placeholder="#0f172a"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>PDF template</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={doc.layout.template}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    layout: { ...doc.layout, template: e.target.value as ResumeDocumentV1['layout']['template'] },
                  })
                }
              >
                <option value="classic">Classic — centered executive</option>
                <option value="compact">Compact — dense single column</option>
                <option value="accent">Accent — vertical brand bar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Section rules</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={doc.layout.ruleStyle}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    layout: { ...doc.layout, ruleStyle: e.target.value as ResumeDocumentV1['layout']['ruleStyle'] },
                  })
                }
              >
                <option value="none">Minimal (no rules)</option>
                <option value="accent">Accent underline</option>
                <option value="full">Neutral full width</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Header layout</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={doc.layout.headerStyle}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    layout: { ...doc.layout, headerStyle: e.target.value as ResumeDocumentV1['layout']['headerStyle'] },
                  })
                }
              >
                <option value="centered">Centered</option>
                <option value="split">Left-aligned</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
              <span className="text-sm">Page numbers &amp; footer</span>
              <Switch
                checked={doc.layout.showPageNumbersInPdf !== false}
                onCheckedChange={(v) => setDoc({ ...doc, layout: { ...doc.layout, showPageNumbersInPdf: v } })}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5">
              <span className="text-sm">Page-break hints in proof</span>
              <Switch
                checked={doc.layout.showPageBreakHints}
                onCheckedChange={(v) => setDoc({ ...doc, layout: { ...doc.layout, showPageBreakHints: v } })}
              />
            </label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
