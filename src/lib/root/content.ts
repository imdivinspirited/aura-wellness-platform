/**
 * Content Abstraction Layer
 *
 * Provides utilities for managing content elements with stable IDs.
 * This layer abstracts content from UI, enabling root editing without
 * directly mutating JSX.
 */

import { useRootStore } from '@/stores/rootStore';
import { useUserStore } from '@/stores/userStore';
import { useLocation } from 'react-router-dom';
import { getCurrentRootUserId } from './auth';
import type { ContentElement, ContentUpdate, LocalizedString } from './types';

/**
 * Generate stable element ID
 *
 * Creates a unique, stable ID for any content element.
 * Format: page-path_element-type_index or custom-id
 */
export function generateElementId(
  page: string,
  type: ContentElement['type'],
  index?: number,
  customId?: string
): string {
  if (customId) {
    return customId;
  }

  const pageSlug =
    page
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9-]/gi, '')
      .toLowerCase() || 'root';

  const typeSlug = type.toLowerCase();
  const indexPart = index !== undefined ? `-${index}` : '';

  return `${pageSlug}_${typeSlug}${indexPart}`;
}

/**
 * Get content value for element
 *
 * Returns the edited value if exists, otherwise returns the default value.
 */
export function getContentValue(elementId: string, defaultValue: string): string {
  const { getElementContent } = useRootStore.getState();
  const element = getElementContent(elementId);
  if (!element?.value) return defaultValue;
  if (typeof element.value === 'string') return element.value;

  const lang = useUserStore.getState().language || 'en';
  const map = element.value as LocalizedString;
  return map[lang] ?? map.en ?? defaultValue;
}

/**
 * Update content element
 *
 * Creates a content update and adds it to pending changes.
 */
export function updateContentElement(
  elementId: string,
  type: ContentElement['type'],
  newValue: string,
  page: string,
  metadata?: Record<string, unknown>
): void {
  const rootUserId = getCurrentRootUserId();
  if (!rootUserId) {
    console.warn('[Root Content] Cannot update: No root user session');
    return;
  }

  const { getElementContent, addPendingChange, updateContent } = useRootStore.getState();
  const existing = getElementContent(elementId);
  const language = useUserStore.getState().language || 'en';

  // Extract the actual previous value as a string
  let previousValue: string | undefined;
  if (existing?.value) {
    if (typeof existing.value === 'string') {
      previousValue = existing.value;
    } else {
      const map = existing.value as LocalizedString;
      previousValue = map[language] ?? map.en;
    }
  }

  const update: ContentUpdate = {
    elementId,
    type,
    value: newValue,
    page,
    timestamp: Date.now(),
    rootUserId,
    previousValue,
    metadata,
    language,
  };

  // Add to pending changes
  addPendingChange(update);

  // Update immediately for live preview
  updateContent(update);
}

/**
 * Hook for using content in components
 *
 * Usage:
 * const { value, update } = useRootContent('element-id', 'heading', 'Default Text');
 */
export function useRootContent(
  elementId: string,
  type: ContentElement['type'],
  defaultValue: string,
  metadata?: Record<string, unknown>
) {
  const location = useLocation();
  const { getElementContent, isActive } = useRootStore();
  const element = getElementContent(elementId);
  const language = useUserStore(s => s.language) || 'en';
  const value =
    typeof element?.value === 'string'
      ? element.value
      : ((element?.value as LocalizedString | undefined)?.[language] ??
        (element?.value as LocalizedString | undefined)?.en ??
        defaultValue);

  const update = (newValue: string) => {
    updateContentElement(elementId, type, newValue, location.pathname, metadata);
  };

  return {
    value,
    update,
    isEdited: !!element,
    isActive,
  };
}

/**
 * Initialize content element
 *
 * Registers an element in the content map if it doesn't exist.
 */
export function initializeContentElement(
  elementId: string,
  type: ContentElement['type'],
  defaultValue: string,
  page: string,
  metadata?: Record<string, unknown>
): void {
  const { getElementContent, setElementContent } = useRootStore.getState();
  const existing = getElementContent(elementId);

  if (!existing) {
    const element: ContentElement = {
      id: elementId,
      type,
      page,
      value: defaultValue,
      metadata,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setElementContent(element);
  }
}
