import { Fragment, memo } from 'react';
import { cn } from '@/lib/utils';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type HighlightedTextProps = {
  text: string;
  terms: string[];
  className?: string;
};

/**
 * Bold / mark matched query terms (client-side “snippet highlighting”).
 */
export const HighlightedText = memo(function HighlightedText({ text, terms, className }: HighlightedTextProps) {
  const clean = terms.filter((t) => t.length > 1);
  if (!clean.length) return <span className={className}>{text}</span>;

  const pattern = new RegExp(`(${clean.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isMatch = clean.some((t) => t.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={i}
              className={cn('rounded-sm bg-primary/20 px-0.5 font-medium text-foreground dark:bg-primary/30')}
            >
              {part}
            </mark>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
});
