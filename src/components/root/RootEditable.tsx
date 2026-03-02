/**
 * Root Editable Component
 *
 * Higher-order component that makes any element editable in root mode.
 * This is a non-breaking wrapper that adds editing capabilities.
 *
 * Usage:
 * <RootEditable id="hero-title" type="heading">
 *   <h1>Welcome</h1>
 * </RootEditable>
 */

import { useRootStore } from '@/stores/rootStore';
import { getCurrentRootUserId } from '@/lib/root/auth';
import { useLocation } from 'react-router-dom';
import type { ContentElement } from '@/lib/root/types';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';

interface RootEditableProps {
  id: string;
  type: ContentElement['type'];
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  metadata?: Record<string, unknown>;
}

/**
 * Root Editable Wrapper
 *
 * Wraps any element to make it editable in root mode.
 * In normal mode, this is a transparent pass-through.
 */
export function RootEditable({
  id,
  type,
  children,
  className,
  as: Component = 'div',
  metadata,
}: RootEditableProps) {
  const { isActive, contentMap, getElementContent, updateContent, addPendingChange } = useRootStore();
  const location = useLocation();
  const rootUserId = getCurrentRootUserId();
  const language = useUserStore((s) => s.language) || 'en';

  // Get content from store or use children as default
  const element = getElementContent(id);
  const displayValue =
    typeof element?.value === 'string'
      ? element.value
      : (element?.value as Record<string, string> | undefined)?.[language] ??
        (element?.value as Record<string, string> | undefined)?.en ??
        (typeof children === 'string' ? children : null);

  // If root mode is active, make editable
  if (isActive) {
    const handleContentChange = (newValue: string) => {
      if (!rootUserId) return;

      const update = {
        elementId: id,
        type,
        value: newValue,
        page: location.pathname,
        timestamp: Date.now(),
        rootUserId,
        previousValue: typeof element?.value === 'string' ? element.value : (element?.value as any)?.[language],
        metadata,
        language,
      };

      // Add to pending changes
      addPendingChange(update);

      // Update immediately for live preview
      updateContent(update);
    };

    return (
      <Component
        data-root-id={id}
        data-root-type={type}
        className={cn('root-editable', className)}
        contentEditable={isActive}
        suppressContentEditableWarning
        onBlur={(e) => {
          const newValue = e.currentTarget.textContent || '';
          if (newValue !== element?.value) {
            handleContentChange(newValue);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && type !== 'paragraph') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      >
        {displayValue || children}
      </Component>
    );
  }

  // Normal mode: just render children with data attribute for potential future use
  return (
    <Component
      data-root-id={id}
      data-root-type={type}
      className={className}
    >
      {displayValue || children}
    </Component>
  );
}
