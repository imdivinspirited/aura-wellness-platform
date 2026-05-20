/**
 * Premium events refine search: fuzzy index over all event text (future-proof),
 * live suggestions, keyboard navigation, debounced filter sync.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, Loader2, Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Event } from '@/pages/events/types';
import { searchEventsForSuggestions } from '@/pages/events/utils/eventSearchIndex';

const DEBOUNCE_MS = 280;
const SUGGEST_LIMIT = 8;

type Props = {
  categoryScopedEvents: Event[];
  /** From URL — kept in sync when user shares link or uses browser navigation */
  urlQuery: string;
  resetKey: number;
  onDebouncedSearch: (q: string) => void;
  onPickEvent: (slug: string) => void;
};

export function EventsRefineSearch({
  categoryScopedEvents,
  urlQuery,
  resetKey,
  onDebouncedSearch,
  onPickEvent,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const [draft, setDraft] = useState(urlQuery);
  const debounced = useDebouncedValue(draft, DEBOUNCE_MS);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const syncing = draft !== debounced;

  useEffect(() => {
    setDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setDraft('');
  }, [resetKey]);

  useEffect(() => {
    onDebouncedSearch(debounced);
  }, [debounced, onDebouncedSearch]);

  const suggestions = useMemo(() => {
    const q = draft.trim();
    if (q.length < 1) return [];
    return searchEventsForSuggestions(categoryScopedEvents, q, SUGGEST_LIMIT);
  }, [categoryScopedEvents, draft]);

  useEffect(() => {
    setActiveIndex(0);
  }, [draft, suggestions.length]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const root = inputRef.current?.closest('[data-refine-search-root]');
      if (root && !root.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = useCallback(
    (slug: string) => {
      setOpen(false);
      onPickEvent(slug);
    },
    [onPickEvent]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (open && suggestions.length > 0) {
        setOpen(false);
      } else if (draft) {
        setDraft('');
      }
      return;
    }

    if (!suggestions.length) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const ev = suggestions[activeIndex];
      if (ev) pick(ev.slug);
    }
  };

  const formatHint = (e: Event) => {
    const city = e.location.city || e.location.name;
    const d = new Date(e.startDate);
    const when = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return [when, city].filter(Boolean).join(' · ');
  };

  return (
    <div className="space-y-1" data-refine-search-root>
      <label
        htmlFor="events-refine-search"
        className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
      >
        <Search className="h-3 w-3 opacity-70" aria-hidden />
        Search
      </label>

      <div className="relative">
        <div
          className={cn(
            'group rounded-xl border border-border/60 bg-gradient-to-br from-background/95 via-background/85 to-muted/20 p-[1px] shadow-[0_1px_0_0_hsl(var(--background)/0.8)] transition-shadow',
            'focus-within:border-primary/35 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_12px_40px_-24px_rgba(0,0,0,0.35)]',
            'dark:from-background/40 dark:via-background/30 dark:to-primary/[0.04] dark:focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]'
          )}
        >
          <div className="relative flex items-center rounded-[0.6875rem] border border-white/10 bg-background/90 dark:border-white/[0.06] dark:bg-black/35">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/75"
              aria-hidden
            />
            <Input
              ref={inputRef}
              id="events-refine-search"
              type="search"
              role="combobox"
              aria-expanded={open && suggestions.length > 0}
              aria-controls={suggestions.length > 0 ? listboxId : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Title, speaker, city, tag, keyword…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(draft.trim().length > 0)}
              onKeyDown={handleKeyDown}
              className={cn(
                'h-10 border-0 bg-transparent pl-9 pr-[4.25rem] text-sm shadow-none',
                'placeholder:text-muted-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              aria-label="Search events with smart suggestions"
            />
            <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/70" aria-hidden />
              ) : null}
              {draft ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="pointer-events-auto h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setDraft('');
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {open && suggestions.length > 0 ? (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border/70 bg-popover/95 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-popover/90"
          >
            <div className="flex items-center justify-between border-b border-border/50 px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground dark:border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary/80" aria-hidden />
                Suggestions
              </span>
              <span className="tabular-nums text-[0.6rem] normal-case tracking-normal">
                {suggestions.length} match{suggestions.length === 1 ? '' : 'es'}
              </span>
            </div>
            <ul className="max-h-[min(18rem,50vh)] overflow-y-auto py-1">
              {suggestions.map((ev, index) => {
                const active = index === activeIndex;
                return (
                  <li key={ev.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      data-index={index}
                      aria-selected={active}
                      className={cn(
                        'flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                        active ? 'bg-primary/10 text-foreground' : 'text-foreground hover:bg-muted/60'
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(ev.slug)}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate font-medium leading-tight">{ev.title}</p>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] text-muted-foreground">
                          {formatHint(ev) ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                              {formatHint(ev)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <span className="shrink-0 pt-0.5 text-[0.65rem] font-medium text-primary/90">Open</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-3 py-1.5 text-[0.65rem] text-muted-foreground dark:border-white/[0.06]">
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-border/80 bg-background/80 px-1 font-mono text-[0.6rem]">↑</kbd>
                <kbd className="rounded border border-border/80 bg-background/80 px-1 font-mono text-[0.6rem]">↓</kbd>
                <span className="hidden sm:inline">Navigate</span>
              </span>
              <span className="flex items-center gap-2">
                <kbd className="rounded border border-border/80 bg-background/80 px-1.5 font-mono text-[0.6rem]">↵</kbd>
                <span>Open</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <p className="text-[0.65rem] leading-snug text-muted-foreground/90">
        Fuzzy search across titles, descriptions, locations, speakers, tags, schedule, and{' '}
        <span className="text-foreground/80">any new fields</span> added to events later.
      </p>
    </div>
  );
}
