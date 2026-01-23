/**
 * Root Store
 *
 * Zustand store for managing root edit mode state.
 * This is completely separate from user store and doesn't affect normal users.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RootEditState, ContentElement, ContentUpdate } from '@/lib/root/types';
import { getSession, getCurrentRootUserId } from '@/lib/root/auth';

export type RootElementRuntimeIndex = Record<
  string,
  {
    elementId: string;
    page: string;
    selector: string;
    typeHint?: ContentElement['type'];
    lastSeenAt: number;
  }
>;

export type RootOperationType =
  | 'ADD'
  | 'UPDATE'
  | 'DELETE'
  | 'DUPLICATE'
  | 'MOVE'
  | 'REPLACE'
  | 'STYLE'
  | 'LAYOUT'
  | 'RESPONSIVE'
  | 'LOGIC';

export type RootOperationPayload = {
  opId: string;
  type: RootOperationType;
  elementId: string;
  page: string;
  selector?: string;
  patch: {
    // Minimal: content edit (textContent). We expand to props/styles/layout later.
    content?: { previous: string; next: string };
  };
  createdAt: number;
  rootUserId: string;
};

interface RootState extends RootEditState {
  // Session
  session: ReturnType<typeof getSession> | null;

  // Content
  contentMap: Record<string, ContentElement>;

  // Runtime element registry (selector-based targeting for any DOM element)
  elementIndex: RootElementRuntimeIndex;

  // Undo/Redo stacks (Command pattern)
  undoStack: RootOperationPayload[];
  redoStack: RootOperationPayload[];

  // Actions
  activateRootMode: () => void;
  deactivateRootMode: () => void;
  setSelectedElement: (elementId: string | null) => void;
  setHoveredElement: (elementId: string | null) => void;
  upsertRuntimeElement: (entry: RootElementRuntimeIndex[string]) => void;
  updateContent: (update: ContentUpdate) => void;
  addPendingChange: (update: ContentUpdate) => void;
  clearPendingChanges: () => void;
  publishChanges: () => Promise<void>;
  rollbackChange: (elementId: string) => void;
  executeOperation: (op: RootOperationPayload) => void;
  undo: () => void;
  redo: () => void;

  // Content management
  getElementContent: (elementId: string) => ContentElement | null;
  setElementContent: (element: ContentElement) => void;
}

const defaultState: RootEditState = {
  isActive: false,
  selectedElementId: null,
  hoveredElementId: null,
  isPublishing: false,
  pendingChanges: [],
};

export const useRootStore = create<RootState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      session: null,
      contentMap: {},
      elementIndex: {},
      undoStack: [],
      redoStack: [],

      activateRootMode: () => {
        const session = getSession();
        if (!session) {
          console.warn('[Root Store] Cannot activate root mode: No session');
          return;
        }
        set({ isActive: true, session });
      },

      deactivateRootMode: () => {
        set({
          ...defaultState,
          session: null,
          elementIndex: {},
          undoStack: [],
          redoStack: [],
        });
      },

      setSelectedElement: (elementId) => {
        set({ selectedElementId: elementId });
      },

      setHoveredElement: (elementId) => {
        set({ hoveredElementId: elementId });
      },

      upsertRuntimeElement: (entry) => {
        const { elementIndex } = get();
        set({
          elementIndex: {
            ...elementIndex,
            [entry.elementId]: entry,
          },
        });
      },

      updateContent: (update) => {
        const { contentMap } = get();
        const existing = contentMap[update.elementId];

        // If language is provided, store value as a localized map.
        // Backward compatible: existing string values remain strings unless a non-default language edit occurs.
        const nextValue: ContentElement['value'] = (() => {
          if (!update.language) return update.value;

          const lang = update.language;
          // Normalize existing into a map
          const existingMap: Record<string, string> =
            typeof existing?.value === 'object' && existing?.value
              ? (existing.value as Record<string, string>)
              : {
                  // Preserve previous plain string as 'en' baseline if we have it
                  ...(typeof existing?.value === 'string' && existing.value
                    ? { en: existing.value }
                    : {}),
                };

          return {
            ...existingMap,
            [lang]: update.value,
          };
        })();

        const element: ContentElement = {
          id: update.elementId,
          type: update.type,
          page: update.page,
          value: nextValue,
          metadata: update.metadata,
          version: existing ? existing.version + 1 : 1,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
          updatedBy: update.rootUserId,
        };

        set({
          contentMap: {
            ...contentMap,
            [update.elementId]: element,
          },
        });
      },

      addPendingChange: (update) => {
        const { pendingChanges } = get();
        set({
          pendingChanges: [...pendingChanges, update],
        });
      },

      clearPendingChanges: () => {
        set({ pendingChanges: [] });
      },

      publishChanges: async () => {
        const { pendingChanges, contentMap } = get();
        const rootUserId = getCurrentRootUserId();

        if (!rootUserId) {
          console.error('[Root Store] Cannot publish: No root user session');
          return;
        }

        set({ isPublishing: true });

        try {
          // Apply all pending changes
          for (const update of pendingChanges) {
            get().updateContent(update);
          }

          // Persist to storage (in production, this would be an API call)
          await persistContentMap(contentMap);

          // Clear pending changes
          set({ pendingChanges: [], isPublishing: false });

          // Broadcast update (in production, this would be WebSocket/SSE)
          broadcastContentUpdate();
        } catch (error) {
          console.error('[Root Store] Failed to publish changes:', error);
          set({ isPublishing: false });
        }
      },

      executeOperation: (op) => {
        // Minimal operation application: content edits (textContent)
        const { undoStack } = get();
        set({
          undoStack: [...undoStack, op],
          redoStack: [], // clear redo chain on new op
        });

        if (op.patch.content) {
          const rootUserId = getCurrentRootUserId();
          if (!rootUserId) return;

          // Keep ContentMap in sync (this is what RootEditable uses)
          get().updateContent({
            elementId: op.elementId,
            type: (get().elementIndex[op.elementId]?.typeHint || 'text') as ContentElement['type'],
            value: op.patch.content.next,
            page: op.page,
            timestamp: Date.now(),
            rootUserId: rootUserId as any,
            previousValue: op.patch.content.previous,
            metadata: {
              selector: op.selector,
            },
          });
        }
      },

      undo: () => {
        const { undoStack, redoStack, elementIndex } = get();
        const op = undoStack[undoStack.length - 1];
        if (!op) return;

        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, op],
        });

        if (op.patch.content) {
          const entry = elementIndex[op.elementId];
          const selector = entry?.selector || op.selector;
          if (selector) {
            const el = document.querySelector(selector) as HTMLElement | null;
            if (el) el.textContent = op.patch.content.previous;
          }
        }
      },

      redo: () => {
        const { undoStack, redoStack, elementIndex } = get();
        const op = redoStack[redoStack.length - 1];
        if (!op) return;

        set({
          undoStack: [...undoStack, op],
          redoStack: redoStack.slice(0, -1),
        });

        if (op.patch.content) {
          const entry = elementIndex[op.elementId];
          const selector = entry?.selector || op.selector;
          if (selector) {
            const el = document.querySelector(selector) as HTMLElement | null;
            if (el) el.textContent = op.patch.content.next;
          }
        }
      },

      rollbackChange: (elementId) => {
        const { contentMap, pendingChanges } = get();
        const element = contentMap[elementId];

        if (!element || element.version === 1) {
          return; // Nothing to rollback
        }

        // Remove from pending changes
        const filtered = pendingChanges.filter((c) => c.elementId !== elementId);

        // Restore previous version (simplified - in production, use version history)
        const previous = { ...element, version: element.version - 1 };

        set({
          contentMap: {
            ...contentMap,
            [elementId]: previous,
          },
          pendingChanges: filtered,
        });
      },

      getElementContent: (elementId) => {
        const { contentMap } = get();
        return contentMap[elementId] || null;
      },

      setElementContent: (element) => {
        const { contentMap } = get();
        set({
          contentMap: {
            ...contentMap,
            [element.id]: element,
          },
        });
      },
    }),
    {
      name: 'root-store',
      partialize: (state) => ({
        contentMap: state.contentMap,
        elementIndex: state.elementIndex,
        undoStack: state.undoStack,
        redoStack: state.redoStack,
        // Don't persist session or active state
      }),
    }
  )
);

/**
 * Persist content map to storage
 * In production, this would be an API call to save to database
 */
async function persistContentMap(contentMap: Record<string, ContentElement>): Promise<void> {
  // In production: await fetch('/api/root/content', { method: 'POST', body: JSON.stringify(contentMap) });

  // For now, use localStorage as fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem('root-content-map', JSON.stringify(contentMap));
  }
}

/**
 * Broadcast content update
 * In production, this would use WebSocket or SSE
 */
function broadcastContentUpdate(): void {
  // In production: websocket.send({ type: 'content-update', timestamp: Date.now() });

  // For now, dispatch a custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('root-content-updated'));
  }
}
