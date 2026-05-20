/**
 * Sortable experience rows — Canva-like: click card to select, double-click to edit, drag when selected.
 */

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useReducer, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import { newExperienceItem } from '@/lib/resume/primitives/document';
import { sortableDragOnlyStyle } from '@/lib/resume/sortableVisualScaleStyle';
import type { VisualScale2D } from '@/lib/resume/types';
import { clampScale1d, normalizeVisualScale } from '@/lib/resume/visualScale2d';
import type { CanvasResizeAnchor } from '@/lib/resume/canvasResizeAnchor';

type ResizeEdge = CanvasResizeAnchor;

export interface ResumePreviewCanvasExperienceProps {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
  bodyPt: number;
  smallPt: number;
  editingExpId: string | null;
  setEditingExpId: (id: string | null) => void;
  selectedCanvasKey: string | null;
  setSelectedCanvasKey: Dispatch<SetStateAction<string | null>>;
}

export function ResumePreviewCanvasExperience({
  doc,
  setDoc,
  bodyPt,
  smallPt,
  editingExpId,
  setEditingExpId,
  selectedCanvasKey,
  setSelectedCanvasKey,
}: ResumePreviewCanvasExperienceProps) {
  if (!doc.visibility.experience) return null;

  const addRole = () => {
    const item = newExperienceItem();
    setDoc((d) => ({ ...d, experience: [...d.experience, item] }));
    setSelectedCanvasKey(item.id);
    setEditingExpId(item.id);
  };

  if (doc.experience.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] p-4 dark:bg-primary/[0.06]">
        <p className="mb-3 text-sm text-muted-foreground">
          Add roles — click a card to select, double-click to edit, drag the selected card to reorder.
        </p>
        <Button type="button" size="sm" className="gap-1.5" onClick={addRole}>
          <Plus className="h-4 w-4" />
          Add experience
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <ul className="space-y-3">
        {doc.experience.map((ex) => (
          <SortableExp
            key={ex.id}
            id={ex.id}
            ex={ex}
            editingExpId={editingExpId}
            setDoc={setDoc}
            bodyPt={bodyPt}
            smallPt={smallPt}
            setEditingExpId={setEditingExpId}
            selectedCanvasKey={selectedCanvasKey}
            setSelectedCanvasKey={setSelectedCanvasKey}
          />
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" className="gap-1.5 border-dashed" onClick={addRole}>
        <Plus className="h-4 w-4" />
        Add role
      </Button>
    </div>
  );
}

function SortableExp({
  id,
  ex,
  editingExpId,
  setDoc,
  bodyPt,
  smallPt,
  setEditingExpId,
  selectedCanvasKey,
  setSelectedCanvasKey,
}: {
  id: string;
  ex: ResumeDocumentV1['experience'][number];
  editingExpId: string | null;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
  bodyPt: number;
  smallPt: number;
  setEditingExpId: (id: string | null) => void;
  selectedCanvasKey: string | null;
  setSelectedCanvasKey: Dispatch<SetStateAction<string | null>>;
}) {
  const isCardSelected = selectedCanvasKey === ex.id;

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: null,
    animateLayoutChanges: () => false,
    disabled: !isCardSelected,
  });

  const editing = editingExpId === ex.id;
  const blockVs = normalizeVisualScale(ex.blockScale);
  const cardFont = (blockVs.x + blockVs.y) / 2;
  const bPt = bodyPt * cardFont;
  const sPt = smallPt * cardFont;
  const liveResizeEdgeRef = useRef<CanvasResizeAnchor | null>(null);
  const [, bumpResizeVisual] = useReducer((x: number) => x + 1, 0);

  const style = sortableDragOnlyStyle(transform, transition, {
    zIndex: isDragging ? 20 : undefined,
  });

  const patchEx = (patch: Partial<typeof ex>) => {
    setDoc((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === ex.id ? { ...e, ...patch } : e)),
    }));
  };

  const removeRole = () => {
    setDoc((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== ex.id) }));
    if (editingExpId === ex.id) setEditingExpId(null);
    if (selectedCanvasKey === ex.id) setSelectedCanvasKey(null);
  };

  const frozenStart = useRef<VisualScale2D>({ x: 1, y: 1 });
  const startClient = useRef({ x: 0, y: 0 });

  const onResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isCardSelected) return;
      frozenStart.current = { ...normalizeVisualScale(ex.blockScale) };
      startClient.current = { x: e.clientX, y: e.clientY };
      const rowId = ex.id;
      const onMove = (ev: MouseEvent) => {
        const { x: sx, y: sy } = startClient.current;
        const s0 = frozenStart.current;
        let next: VisualScale2D;
        switch (edge) {
          case 'n':
            next = { x: s0.x, y: clampScale1d(s0.y + (sy - ev.clientY) * 0.004) };
            break;
          case 's':
            next = { x: s0.x, y: clampScale1d(s0.y + (ev.clientY - sy) * 0.004) };
            break;
          case 'e':
            next = { x: clampScale1d(s0.x + (ev.clientX - sx) * 0.004), y: s0.y };
            break;
          case 'w':
            next = { x: clampScale1d(s0.x + (sx - ev.clientX) * 0.004), y: s0.y };
            break;
          case 'se':
            next = {
              x: clampScale1d(s0.x + (ev.clientX - sx) * 0.004),
              y: clampScale1d(s0.y + (ev.clientY - sy) * 0.004),
            };
            break;
          default:
            return;
        }
        setDoc((doc) => ({
          ...doc,
          experience: doc.experience.map((row) =>
            row.id === rowId ? { ...row, blockScale: next } : row
          ),
        }));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        patchEx({ blockResizeAnchor: edge });
        liveResizeEdgeRef.current = null;
        bumpResizeVisual();
      };
      liveResizeEdgeRef.current = edge;
      bumpResizeVisual();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [ex.id, ex.blockScale, setDoc, isCardSelected]
  );

  const blockDragFromInteractive: React.PointerEventHandler<HTMLDivElement> = useCallback((e) => {
    const t = e.target as HTMLElement;
    if (
      t.closest(
        '[data-no-dnd],input,textarea,button,a,select,[role="slider"],[role="combobox"],[cmdk-item]'
      )
    ) {
      e.stopPropagation();
    }
  }, []);

  const cardChromeClick: React.MouseEventHandler = useCallback(
    (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-canvas-no-select]')) return;
      setSelectedCanvasKey(ex.id);
    },
    [ex.id, setSelectedCanvasKey]
  );

  const bodyDoubleClick: React.MouseEventHandler = useCallback(
    (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-canvas-no-select]')) return;
      e.preventDefault();
      e.stopPropagation();
      setEditingExpId(ex.id);
    },
    [ex.id, setEditingExpId]
  );

  return (
    <li
      ref={setNodeRef}
      data-canvas-block
      style={style}
      className={cn('relative list-none', isDragging && 'opacity-95')}
      {...attributes}
    >
      <div
        ref={setActivatorNodeRef}
        className={cn(
          'relative rounded-lg border-2 p-2 pr-10 transition-colors',
          isCardSelected
            ? 'cursor-grab border-dashed border-primary/40 bg-zinc-500/[0.08] ring-2 ring-primary/15 dark:bg-white/[0.08] active:cursor-grabbing'
            : 'cursor-pointer border-transparent bg-zinc-500/[0.03] hover:border-zinc-400/35 hover:bg-zinc-500/[0.06] dark:bg-white/[0.03] dark:hover:border-zinc-500/40',
          editing && 'border-primary/40 bg-zinc-500/[0.1] dark:bg-white/[0.08]',
          isDragging && 'border-primary/50 ring-2 ring-primary/15'
        )}
        onClick={cardChromeClick}
        onPointerDownCapture={blockDragFromInteractive}
        {...(isCardSelected ? listeners : {})}
      >
        {isCardSelected ? (
          <div className="absolute right-1 top-1 z-10 flex gap-0.5">
            <Button
              type="button"
              data-no-dnd
              data-canvas-no-select
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete role"
              onClick={(e) => {
                e.stopPropagation();
                removeRole();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {isCardSelected ? (
          <>
            <div
              data-no-dnd
              data-canvas-no-select
              role="presentation"
              className="absolute left-2 right-8 top-0 z-30 h-1.5 cursor-ns-resize"
              title="Resize from top"
              aria-hidden
              onMouseDown={onResizeMouseDown('n')}
            />
            <div
              data-no-dnd
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-0 left-2 right-8 z-30 h-1.5 cursor-ns-resize"
              title="Resize from bottom"
              aria-hidden
              onMouseDown={onResizeMouseDown('s')}
            />
            <div
              data-no-dnd
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-6 left-0 top-2 z-30 w-1.5 cursor-ew-resize"
              title="Resize from left"
              aria-hidden
              onMouseDown={onResizeMouseDown('w')}
            />
            <div
              data-no-dnd
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-6 right-0 top-2 z-30 w-1.5 cursor-ew-resize"
              title="Resize from right"
              aria-hidden
              onMouseDown={onResizeMouseDown('e')}
            />
            <div
              data-no-dnd
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-1 right-1 z-30 h-4 w-4 cursor-nwse-resize rounded-sm border border-primary/45 bg-background/95 hover:bg-primary/10"
              title="Resize card"
              aria-label="Resize experience card"
              onMouseDown={onResizeMouseDown('se')}
            />
          </>
        ) : null}

        <div className="min-w-0 space-y-1">
          {editing ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={ex.title}
                onChange={(e) => patchEx({ title: e.target.value })}
                placeholder="Job title"
                className="font-semibold"
                style={{ fontSize: `${bPt}pt` }}
              />
              <Input
                value={ex.company}
                onChange={(e) => patchEx({ company: e.target.value })}
                placeholder="Company"
                style={{ fontSize: `${sPt}pt` }}
              />
              <div className="flex flex-wrap gap-2">
                <Input
                  className="min-w-[7rem] flex-1"
                  value={ex.start}
                  onChange={(e) => patchEx({ start: e.target.value })}
                  placeholder="Start (YYYY-MM)"
                  style={{ fontSize: `${sPt}pt` }}
                />
                <Input
                  className="min-w-[7rem] flex-1"
                  value={ex.current ? '' : ex.end}
                  onChange={(e) => patchEx({ end: e.target.value })}
                  placeholder="End (YYYY-MM)"
                  disabled={ex.current}
                  style={{ fontSize: `${sPt}pt` }}
                />
              </div>
              <Input
                value={ex.location}
                onChange={(e) => patchEx({ location: e.target.value })}
                placeholder="Location"
                style={{ fontSize: `${sPt}pt` }}
              />
              <label className="flex cursor-pointer items-center gap-2 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${sPt}pt` }}>
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={ex.current}
                  onChange={(e) => patchEx({ current: e.target.checked, end: e.target.checked ? '' : ex.end })}
                />
                I currently work here
              </label>
              <Textarea
                value={ex.summary}
                onChange={(e) => patchEx({ summary: e.target.value })}
                placeholder="Role summary"
                rows={2}
                style={{ fontSize: `${sPt}pt` }}
              />
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Bullets</p>
                {ex.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1">
                    <span className="select-none pt-2 text-zinc-500">•</span>
                    <Input
                      className="h-auto min-h-0 flex-1 border-border/60"
                      value={b}
                      onChange={(e) => {
                        const bullets = [...ex.bullets];
                        bullets[bi] = e.target.value;
                        patchEx({ bullets });
                      }}
                      placeholder="Achievement or responsibility"
                      style={{ fontSize: `${sPt}pt` }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0 text-muted-foreground"
                      aria-label="Remove bullet"
                      onClick={() => patchEx({ bullets: ex.bullets.filter((_, i) => i !== bi) })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => patchEx({ bullets: [...ex.bullets, ''] })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add bullet
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-1"
                onClick={() => {
                  setEditingExpId(null);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div data-canvas-block-surface onDoubleClick={bodyDoubleClick}>
              <div className="w-full text-left">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100" style={{ fontSize: `${bPt}pt` }}>
                  {ex.title || 'Role title'}
                  {ex.company ? ` — ${ex.company}` : ''}
                </p>
                <p className="text-zinc-500" style={{ fontSize: `${sPt}pt` }}>
                  {[ex.start?.slice(0, 7), ex.current ? 'Present' : ex.end?.slice(0, 7), ex.location]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {ex.summary ? (
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${sPt}pt` }}>
                    {ex.summary}
                  </p>
                ) : null}
              </div>
              {ex.bullets.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${sPt}pt` }}>
                  {ex.bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-1">
                      <span className="select-none">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
