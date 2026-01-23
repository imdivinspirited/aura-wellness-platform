/**
 * Root Overlay Component
 *
 * Canva-like editing overlay that appears when root mode is active.
 * This is a non-breaking layer that doesn't affect normal users.
 *
 * Features:
 * - Hover outlines on editable elements
 * - Click to edit
 * - Drag & drop (future)
 * - Resize handles (future)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRootStore } from '@/stores/rootStore';
import { cn } from '@/lib/utils';
import { Save, X, Undo2, Redo2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { buildCssSelector, getOrAssignRuntimeRootId } from '@/lib/root/selector';

/**
 * Root Overlay
 *
 * This component wraps the entire app when root mode is active.
 * It adds editing capabilities without modifying existing components.
 */
export function RootOverlay({ children }: { children: React.ReactNode }) {
  const { isActive } = useRootStore();

  // Add/remove body class for root mode
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('root-mode-active');
    } else {
      document.body.classList.remove('root-mode-active');
    }
    return () => {
      document.body.classList.remove('root-mode-active');
    };
  }, [isActive]);

  // Always render the same structure to avoid hook order issues
  // Conditionally render overlay features inside
  return (
    <RootOverlayProvider isActive={isActive}>
      <div className="relative">
        {children}
        {isActive && <RootEditControls />}
      </div>
    </RootOverlayProvider>
  );
}

/**
 * Root Overlay Provider
 *
 * Sets up event listeners for detecting hoverable/editable elements
 */
function RootOverlayProvider({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  const location = useLocation();
  const { setHoveredElement, setSelectedElement, upsertRuntimeElement } = useRootStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !isActive) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const closest = target.closest('[data-root-id]') || target;
      const runtime = getOrAssignRuntimeRootId(closest, location.pathname);
      if (!runtime) {
        setHoveredElement(null);
        return;
      }

      upsertRuntimeElement({
        elementId: runtime.elementId,
        page: location.pathname,
        selector: runtime.selector.startsWith('[') ? runtime.selector : buildCssSelector(closest),
        lastSeenAt: Date.now(),
      });

      setHoveredElement(runtime.elementId);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closest = target.closest('[data-root-id]') || target;
      const runtime = getOrAssignRuntimeRootId(closest, location.pathname);
      if (!runtime) return;

      e.preventDefault();
      e.stopPropagation();
      upsertRuntimeElement({
        elementId: runtime.elementId,
        page: location.pathname,
        selector: runtime.selector,
        lastSeenAt: Date.now(),
      });
      setSelectedElement(runtime.elementId);
    };

    const container = overlayRef.current;
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('click', handleClick);
    };
  }, [setHoveredElement, setSelectedElement, upsertRuntimeElement, location.pathname, isActive]);

  return (
    <div ref={overlayRef} className="root-overlay-container">
      {children}
      {isActive && <RootHoverIndicator />}
    </div>
  );
}

/**
 * Root Hover Indicator
 *
 * Shows outline and edit icon when hovering over editable elements
 */
function RootHoverIndicator() {
  const { hoveredElementId, selectedElementId } = useRootStore();

  useEffect(() => {
    if (!hoveredElementId || hoveredElementId === selectedElementId) {
      // Remove any existing indicators
      const existing = document.querySelectorAll('.root-hover-indicator');
      existing.forEach((el) => el.remove());
      return;
    }

    const element = document.querySelector(`[data-root-id="${hoveredElementId}"]`) as HTMLElement;
    if (!element) return;

    // Remove any existing indicators first
    const existing = document.querySelectorAll('.root-hover-indicator');
    existing.forEach((el) => el.remove());

    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'root-hover-indicator';

    const rect = element.getBoundingClientRect();
    indicator.style.position = 'fixed';
    indicator.style.top = `${rect.top + window.scrollY}px`;
    indicator.style.left = `${rect.left + window.scrollX}px`;
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = `${rect.height}px`;
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '9998';
    indicator.style.border = '2px solid hsl(var(--primary))';
    indicator.style.borderRadius = '4px';
    indicator.style.backgroundColor = 'hsl(var(--primary) / 0.1)';
    indicator.style.transition = 'all 0.2s ease';

    // Add edit icon
    const icon = document.createElement('div');
    icon.className = 'root-edit-icon';
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    icon.style.position = 'absolute';
    icon.style.top = '-8px';
    icon.style.right = '-8px';
    icon.style.background = 'hsl(var(--primary))';
    icon.style.color = 'hsl(var(--primary-foreground))';
    icon.style.borderRadius = '50%';
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.boxShadow = '0 2px 8px hsl(var(--foreground) / 0.2)';

    indicator.appendChild(icon);
    document.body.appendChild(indicator);

    // Update position on scroll/resize
    const updatePosition = () => {
      const newRect = element.getBoundingClientRect();
      indicator.style.top = `${newRect.top + window.scrollY}px`;
      indicator.style.left = `${newRect.left + window.scrollX}px`;
      indicator.style.width = `${newRect.width}px`;
      indicator.style.height = `${newRect.height}px`;
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    };
  }, [hoveredElementId, selectedElementId]);

  return null;
}

/**
 * Root Edit Controls
 *
 * Floating toolbar for root editing actions
 */
function RootEditControls() {
  const {
    isActive,
    selectedElementId,
    pendingChanges,
    isPublishing,
    publishChanges,
    clearPendingChanges,
    undo,
    redo,
    undoStack,
    redoStack,
    elementIndex,
    executeOperation,
  } = useRootStore();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(true);
  const [draft, setDraft] = useState('');

  if (!isActive || !selectedElementId) return null;

  const selected = elementIndex[selectedElementId];
  const selector = selected?.selector || `[data-root-id="${selectedElementId}"]`;

  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    setDraft(el?.textContent || '');
  }, [selector, selectedElementId]);

  const applyDraft = () => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const previous = el.textContent || '';
    const next = draft;
    if (previous === next) return;

    // Apply to DOM immediately (live preview)
    el.textContent = next;

    executeOperation({
      opId: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'UPDATE',
      elementId: selectedElementId,
      page: location.pathname,
      selector,
      patch: { content: { previous, next } },
      createdAt: Date.now(),
      rootUserId: 'root', // resolved later from server-side root JWT
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 root-toolbar" data-root-editor-ui="true">
      <TooltipProvider>
        <div className="flex gap-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => undo()}
                variant="outline"
                size="sm"
                className="shadow-lg"
                disabled={undoStack.length === 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => redo()}
                variant="outline"
                size="sm"
                className="shadow-lg"
                disabled={redoStack.length === 0}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setPanelOpen((v) => !v)}
                variant="outline"
                size="sm"
                className="shadow-lg"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit selected element</TooltipContent>
          </Tooltip>
        </div>

        {panelOpen && (
          <div
            className={cn(
              'root-edit-panel w-[360px] rounded-xl border bg-background/95 backdrop-blur shadow-xl p-3',
              'dark:bg-background/90'
            )}
            data-root-editor-ui="true"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Selected</div>
              <Button variant="ghost" size="icon" onClick={() => setPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mb-2 break-all">
              {selectedElementId}
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={cn(
                'w-full min-h-[120px] rounded-lg border bg-background p-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/30'
              )}
            />

            <div className="mt-2 flex gap-2">
              <Button onClick={applyDraft} size="sm" className="flex-1">
                Apply
              </Button>
              <Button
                onClick={() => {
                  const el = document.querySelector(selector) as HTMLElement | null;
                  setDraft(el?.textContent || '');
                }}
                size="sm"
                variant="outline"
              >
                Reset
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={publishChanges}
                disabled={isPublishing || pendingChanges.length === 0}
                size="sm"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Publish ({pendingChanges.length})
              </Button>
              <Button
                onClick={clearPendingChanges}
                variant="outline"
                disabled={pendingChanges.length === 0}
                size="sm"
              >
                Discard
              </Button>
            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
}
