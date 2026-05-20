/**
 * Sortable body section — Canva-like: click to select, double-click body to edit, drag when selected.
 */

import { useCallback, useReducer, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sortableDragOnlyStyle } from '@/lib/resume/sortableVisualScaleStyle';
import type { VisualScale2D } from '@/lib/resume/types';
import { clampScale1d, normalizeVisualScale } from '@/lib/resume/visualScale2d';
import type { CanvasResizeAnchor } from '@/lib/resume/canvasResizeAnchor';

type ResizeEdge = CanvasResizeAnchor;

export function CanvasSortableSection({
  id,
  children,
  title,
  accent,
  titleFontPt,
  fontFamily,
  titleAlign = 'left',
  showChrome = true,
  onHide,
  visualScale,
  onScaleChange,
  resizeAnchor,
  onResizeAnchorCommit,
  isSelected = false,
  onSelectBlock = () => {},
  onRequestTextEdit,
}: {
  id: string;
  children: React.ReactNode;
  title: string;
  accent: string;
  titleFontPt: number;
  fontFamily: string;
  titleAlign?: 'left' | 'center';
  showChrome?: boolean;
  onHide?: () => void;
  visualScale?: number | VisualScale2D;
  onScaleChange?: (scale: VisualScale2D) => void;
  resizeAnchor?: CanvasResizeAnchor;
  onResizeAnchorCommit?: (edge: CanvasResizeAnchor) => void;
  /** Only the active block shows chrome, resize handles, and can be dragged. */
  isSelected?: boolean;
  onSelectBlock?: () => void;
  /** Double-click on body opens edit (e.g. summary). Omit for read-only sections. */
  onRequestTextEdit?: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: null,
    animateLayoutChanges: () => false,
    disabled: !isSelected,
  });
  const frozenStart = useRef<VisualScale2D>({ x: 1, y: 1 });
  const startClient = useRef({ x: 0, y: 0 });
  const liveResizeEdgeRef = useRef<CanvasResizeAnchor | null>(null);
  const [, bumpResizeVisual] = useReducer((x: number) => x + 1, 0);

  const style = sortableDragOnlyStyle(transform, transition, {
    zIndex: isDragging ? 5 : undefined,
  });

  const onResizeMouseDown = useCallback(
    (edge: ResizeEdge) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isSelected) return;
      frozenStart.current = { ...normalizeVisualScale(visualScale) };
      startClient.current = { x: e.clientX, y: e.clientY };

      const onMove = (ev: MouseEvent) => {
        const { x: sx, y: sy } = startClient.current;
        const s0 = frozenStart.current;
        switch (edge) {
          case 'n':
            onScaleChange?.({
              x: s0.x,
              y: clampScale1d(s0.y + (sy - ev.clientY) * 0.004),
            });
            break;
          case 's':
            onScaleChange?.({
              x: s0.x,
              y: clampScale1d(s0.y + (ev.clientY - sy) * 0.004),
            });
            break;
          case 'e':
            onScaleChange?.({
              x: clampScale1d(s0.x + (ev.clientX - sx) * 0.004),
              y: s0.y,
            });
            break;
          case 'w':
            onScaleChange?.({
              x: clampScale1d(s0.x + (sx - ev.clientX) * 0.004),
              y: s0.y,
            });
            break;
          case 'se':
            onScaleChange?.({
              x: clampScale1d(s0.x + (ev.clientX - sx) * 0.004),
              y: clampScale1d(s0.y + (ev.clientY - sy) * 0.004),
            });
            break;
          default:
            break;
        }
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        onResizeAnchorCommit?.(edge);
        liveResizeEdgeRef.current = null;
        bumpResizeVisual();
      };
      liveResizeEdgeRef.current = edge;
      bumpResizeVisual();
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [visualScale, onScaleChange, onResizeAnchorCommit, isSelected]
  );

  const blockDragFromInteractive: React.PointerEventHandler<HTMLElement> = useCallback((e) => {
    const t = e.target as HTMLElement;
    if (
      t.closest(
        '[data-no-dnd],input,textarea,button,a,select,[role="slider"],[role="combobox"],[cmdk-item]'
      )
    ) {
      e.stopPropagation();
    }
  }, []);

  const chromeClick: React.MouseEventHandler = useCallback(
    (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-canvas-no-select]')) return;
      onSelectBlock();
    },
    [onSelectBlock]
  );

  const bodyDoubleClick: React.MouseEventHandler = useCallback(
    (e) => {
      if (!onRequestTextEdit) return;
      const t = e.target as HTMLElement;
      if (t.closest('[data-canvas-no-select]')) return;
      e.preventDefault();
      e.stopPropagation();
      onRequestTextEdit();
    },
    [onRequestTextEdit]
  );

  if (!showChrome) {
    return (
      <section
        ref={setNodeRef}
        data-canvas-block
        style={sortableDragOnlyStyle(transform, transition)}
        className={cn(isDragging && 'opacity-90')}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      ref={setNodeRef}
      data-canvas-block
      style={style}
      className={cn('relative', isDragging && 'z-10 opacity-95')}
      {...attributes}
    >
      <div
        ref={setActivatorNodeRef}
        className={cn(
          'group/section relative rounded-xl border-2 p-2 shadow-sm transition-colors',
          isSelected
            ? 'cursor-grab border-dashed border-primary/50 bg-muted/[0.07] ring-2 ring-primary/20 active:cursor-grabbing'
            : 'cursor-pointer border-transparent bg-transparent hover:border-zinc-300/40 hover:bg-muted/[0.04] dark:hover:border-zinc-600/35',
          isDragging && 'border-primary/50 ring-2 ring-primary/20'
        )}
        onClick={chromeClick}
        onPointerDownCapture={blockDragFromInteractive}
        {...(isSelected ? listeners : {})}
      >
        <div className="mb-1 flex items-start gap-1 sm:gap-2">
          <h3
            className={cn(
              'min-w-0 flex-1 select-none border-b-2 pb-1 font-bold uppercase tracking-[0.18em]',
              titleAlign === 'center' ? 'text-center' : 'text-left',
              isSelected ? 'cursor-default' : 'cursor-pointer'
            )}
            style={{ borderColor: accent, color: accent, fontSize: `${titleFontPt}pt`, fontFamily }}
          >
            {title}
          </h3>
          {onHide && isSelected ? (
            <button
              type="button"
              data-no-dnd
              data-canvas-no-select
              className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Hide ${title}`}
              onClick={(e) => {
                e.stopPropagation();
                onHide();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div data-canvas-block-surface className="pl-0 sm:pl-2" onDoubleClick={bodyDoubleClick}>
          {children}
        </div>

        {onScaleChange && isSelected ? (
          <>
            <div
              data-no-dnd="true"
              data-canvas-no-select
              role="presentation"
              className="absolute left-3 right-8 top-0 z-30 h-2 cursor-ns-resize"
              title="Resize from top"
              aria-hidden
              onMouseDown={onResizeMouseDown('n')}
            />
            <div
              data-no-dnd="true"
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-0 left-3 right-8 z-30 h-2 cursor-ns-resize"
              title="Resize from bottom"
              aria-hidden
              onMouseDown={onResizeMouseDown('s')}
            />
            <div
              data-no-dnd="true"
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-8 left-0 top-3 z-30 w-2 cursor-ew-resize"
              title="Resize from left"
              aria-hidden
              onMouseDown={onResizeMouseDown('w')}
            />
            <div
              data-no-dnd="true"
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-8 right-0 top-3 z-30 w-2 cursor-ew-resize"
              title="Resize from right"
              aria-hidden
              onMouseDown={onResizeMouseDown('e')}
            />
            <div
              data-no-dnd="true"
              data-canvas-no-select
              role="presentation"
              className="absolute bottom-1 right-1 z-30 h-5 w-5 cursor-nwse-resize rounded-sm border border-primary/50 bg-background/95 shadow-sm hover:bg-primary/15"
              title="Resize block"
              aria-label="Resize section block"
              onMouseDown={onResizeMouseDown('se')}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
