/**
 * Events listing — planner-oriented experience: filters that match real data,
 * calendar export, spotlight on the next gathering, and brand-forward hero.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Download,
  Share2,
  Calendar,
  Radio,
  Archive,
  LayoutGrid,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Languages,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getAllEventsSync } from '@/pages/events/services/eventService';
import {
  getEffectiveCategory,
  getSpotlightEvent,
  sortEventsByDate,
} from '@/pages/events/utils/eventCategorization';
import { useEventsClock } from '@/pages/events/hooks/useEventsClock';
import { buildEventsIcs, downloadIcsFile } from '@/pages/events/utils/calendarExport';
import { YoutubeChannelLiveSection } from '@/pages/events/components/YoutubeChannelLiveCard';
import { EventsListingHero } from '@/pages/events/components/EventsListingHero';
import { EventsHorizonSpotlight } from '@/pages/events/components/EventsHorizonSpotlight';
import { EventsLuxuryEventCard } from '@/pages/events/components/EventsLuxuryEventCard';
import { EventsRefineSearch } from '@/pages/events/components/EventsRefineSearch';
import { filterEventsBySearch } from '@/pages/events/utils/eventSearchIndex';
import type { Event } from '@/pages/events/types';

type CategoryTab = 'upcoming' | 'ongoing' | 'past' | 'all';
type VenueFilter = 'all' | 'remote' | 'campus';
type SortKey = 'date-asc' | 'date-desc' | 'title-asc';

const formatDateShort = (startDate: string) =>
  new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function collectTags(events: Event[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    e.tags?.forEach((t) => set.add(t));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function collectLanguages(events: Event[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    e.languages?.forEach((l) => set.add(l));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function matchesVenue(e: Event, venue: VenueFilter): boolean {
  if (venue === 'all') return true;
  if (venue === 'remote') return e.location.online === true;
  const name = (e.location.name || '').toLowerCase();
  return (
    e.location.hybrid === true ||
    (e.location.city || '').toLowerCase() === 'bangalore' ||
    name.includes('international center')
  );
}

export const EventsListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const clock = useEventsClock(30_000);

  const qParam = searchParams.get('q') ?? '';
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>(
    (searchParams.get('category') as CategoryTab) || 'upcoming'
  );
  const [venue, setVenue] = useState<VenueFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date-asc');

  const allEvents = useMemo(() => getAllEventsSync(), [clock]);

  const tagOptions = useMemo(() => collectTags(allEvents), [allEvents]);
  const languageOptions = useMemo(() => collectLanguages(allEvents), [allEvents]);

  const spotlight = useMemo(() => getSpotlightEvent(allEvents), [allEvents]);

  /** Pool for the refine search (suggestions + fuzzy index) — same tab as chips */
  const categoryScopedEvents = useMemo(() => {
    if (selectedCategory === 'all') return allEvents;
    return allEvents.filter((e) => getEffectiveCategory(e) === selectedCategory);
  }, [allEvents, selectedCategory]);

  /** Browser back/forward or shared ?q= should stay aligned with filter state */
  useEffect(() => {
    setSearchQuery((prev) => (prev === qParam ? prev : qParam));
  }, [qParam]);

  /** Shareable search in URL */
  useEffect(() => {
    const trimmed = searchQuery.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) next.set('q', trimmed);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  }, [searchQuery, setSearchParams]);

  const filteredEvents = useMemo(() => {
    let list = categoryScopedEvents;

    list = filterEventsBySearch(list, searchQuery);

    list = list.filter((e) => matchesVenue(e, venue));

    if (selectedTag) {
      list = list.filter((e) => e.tags?.includes(selectedTag));
    }

    if (language !== 'all') {
      list = list.filter((e) => e.languages?.includes(language));
    }

    if (sortKey === 'date-asc') list = sortEventsByDate(list, 'asc');
    else if (sortKey === 'date-desc') list = sortEventsByDate(list, 'desc');
    else {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [categoryScopedEvents, searchQuery, venue, selectedTag, language, sortKey, clock]);

  /** Same gathering as spotlight should not repeat in the grid. */
  const gridEvents = useMemo(() => {
    if (!spotlight) return filteredEvents;
    return filteredEvents.filter((e) => e.id !== spotlight.id);
  }, [filteredEvents, spotlight]);

  const handleCategoryChange = (category: CategoryTab) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') newParams.delete('category');
    else newParams.set('category', category);
    navigate(`/events?${newParams.toString()}`, { replace: true });
  };

  const handleEventOpen = useCallback(
    (slug: string) => {
      navigate(`/events/${slug}`);
    },
    [navigate]
  );

  const handleAddOneToCalendar = useCallback((event: Event) => {
    const body = buildEventsIcs([event], event.title);
    downloadIcsFile(`${event.slug}.ics`, body);
    toast.success('Calendar file downloaded', {
      description: 'Open the file to add this date to Apple Calendar, Google Calendar, or Outlook.',
    });
  }, []);

  const handleDownloadFiltered = useCallback(() => {
    if (!filteredEvents.length) {
      toast.message('Nothing to export', { description: 'Adjust filters or pick another tab.' });
      return;
    }
    const label = `AOLIC Events — ${selectedCategory}`;
    const body = buildEventsIcs(filteredEvents, label);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadIcsFile(`aolic-events-${selectedCategory}-${stamp}.ics`, body);
    toast.success('Exported', {
      description: `${filteredEvents.length} date(s) in your download folder.`,
    });
  }, [filteredEvents, selectedCategory]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Art of Living — Events',
          text: 'Plan gatherings and celebrations',
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied', { description: 'Paste it anywhere to share this view.' });
    } catch {
      toast.error('Could not share');
    }
  }, []);

  const categoryTabs: { id: CategoryTab; label: string; icon: typeof Calendar }[] = [
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'ongoing', label: 'Ongoing', icon: Radio },
    { id: 'past', label: 'Past', icon: Archive },
    { id: 'all', label: 'All', icon: LayoutGrid },
  ];

  return (
    <MainLayout>
      <EventsListingHero />

      <YoutubeChannelLiveSection />

      {spotlight ? (
        <section className="border-b border-primary/10 bg-background/95 backdrop-blur-sm">
          <div className="container py-10">
            <EventsHorizonSpotlight
              event={spotlight}
              onOpen={() => handleEventOpen(spotlight.slug)}
              onAddToCalendar={() => handleAddOneToCalendar(spotlight)}
            />
          </div>
        </section>
      ) : null}

      <section className="sticky top-0 z-30 border-b border-border/60 bg-background/80 py-3 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:shadow-[0_28px_90px_-50px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,hsl(var(--primary)/0.09),transparent_55%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-40%,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="container relative">
          <div className="rounded-3xl border border-border/70 bg-card/40 p-4 shadow-[inset_0_1px_0_0_hsl(var(--background)/0.6)] backdrop-blur-md dark:border-white/[0.08] dark:bg-card/25 md:p-5">
            <div className="flex flex-col gap-2 border-b border-border/50 pb-3 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Refine
                </p>
                <h2 className="font-display text-lg font-light tracking-[-0.02em] text-foreground md:text-xl">
                  Find your gathering
                </h2>
                <p className="sr-only">
                  Search, sort, and filter by how you join — then shape the list by language and theme.
                </p>
              </div>
              <div className="flex shrink-0 items-baseline gap-2 lg:flex-col lg:items-end lg:gap-0 lg:text-right">
                <span className="font-display text-xl font-light tabular-nums text-foreground md:text-2xl">
                  {filteredEvents.length}
                </span>
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  in this view
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div
                className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-muted/30 p-1 dark:border-white/[0.07] dark:bg-white/[0.03]"
                role="tablist"
                aria-label="Event timeframe"
              >
                {categoryTabs.map(({ id, label, icon: Icon }) => {
                  const active = selectedCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleCategoryChange(id)}
                      className={cn(
                        'inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-300 sm:flex-none sm:min-h-9 sm:px-3 sm:text-[0.8125rem]',
                        active
                          ? 'bg-background text-foreground shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] ring-1 ring-border/80 dark:bg-background/90 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] dark:ring-white/10'
                          : 'text-muted-foreground hover:bg-background/50 hover:text-foreground dark:hover:bg-white/[0.04]'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80 sm:h-4 sm:w-4" aria-hidden />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end lg:gap-5">
                <EventsRefineSearch
                  categoryScopedEvents={categoryScopedEvents}
                  urlQuery={qParam}
                  resetKey={searchResetKey}
                  onDebouncedSearch={setSearchQuery}
                  onPickEvent={handleEventOpen}
                />

                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <SlidersHorizontal className="h-3 w-3 opacity-70" aria-hidden />
                    Sort & experience
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground/90">
                        <ArrowUpDown className="h-2.5 w-2.5" aria-hidden />
                        Order
                      </span>
                      <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger className="h-9 rounded-lg border-border/80 bg-background/80 text-left text-xs shadow-sm dark:border-white/[0.08] dark:bg-black/20 sm:text-sm">
                          <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date-asc">Date · soonest first</SelectItem>
                          <SelectItem value="date-desc">Date · latest first</SelectItem>
                          <SelectItem value="title-asc">Title A–Z</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground/90">
                        <MapPin className="h-2.5 w-2.5" aria-hidden />
                        Join
                      </span>
                      <Select value={venue} onValueChange={(v) => setVenue(v as VenueFilter)}>
                        <SelectTrigger className="h-9 rounded-lg border-border/80 bg-background/80 text-left text-xs shadow-sm dark:border-white/[0.08] dark:bg-black/20 sm:text-sm">
                          <SelectValue placeholder="Venue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ways to join</SelectItem>
                          <SelectItem value="remote">Remote / livestream</SelectItem>
                          <SelectItem value="campus">Bangalore IC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground/90">
                        <Languages className="h-2.5 w-2.5" aria-hidden />
                        Language
                      </span>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 rounded-lg border-border/80 bg-background/80 text-left text-xs shadow-sm dark:border-white/[0.08] dark:bg-black/20 sm:text-sm">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any language</SelectItem>
                          {languageOptions.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {tagOptions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary/80" aria-hidden />
                    Topics
                  </p>
                  <div className="relative -mx-1">
                    <div className="flex gap-1.5 overflow-x-auto pb-0.5 pt-0.5 [scrollbar-width:thin] md:flex-wrap md:overflow-visible">
                      <button
                        type="button"
                        onClick={() => setSelectedTag(null)}
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-all duration-200',
                          selectedTag === null
                            ? 'border-primary/35 bg-primary/10 text-foreground shadow-[0_6px_24px_-12px_hsl(var(--primary)/0.5)] dark:bg-primary/15'
                            : 'border-border/70 bg-background/50 text-muted-foreground hover:border-primary/25 hover:bg-muted/50 hover:text-foreground dark:border-white/[0.08] dark:bg-black/15'
                        )}
                      >
                        All topics
                      </button>
                      {tagOptions.map((tag) => {
                        const on = selectedTag === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(on ? null : tag)}
                            className={cn(
                              'shrink-0 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium capitalize transition-all duration-200',
                              on
                                ? 'border-primary/35 bg-primary/10 text-foreground shadow-[0_6px_24px_-12px_hsl(var(--primary)/0.5)] dark:bg-primary/15'
                                : 'border-border/70 bg-background/50 text-muted-foreground hover:border-primary/25 hover:bg-muted/50 hover:text-foreground dark:border-white/[0.08] dark:bg-black/15'
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:border-white/[0.06]">
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    className="h-8 rounded-lg border-primary/25 bg-background/80 px-3 text-xs font-medium shadow-sm transition-colors hover:bg-primary/5 dark:border-primary/30 dark:bg-black/25 sm:h-9 sm:px-4 sm:text-sm"
                    onClick={handleDownloadFiltered}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5 opacity-80 sm:mr-2 sm:h-4 sm:w-4" />
                    Download .ics
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 rounded-lg border-border/80 bg-transparent px-3 text-xs font-medium dark:border-white/[0.12] sm:h-9 sm:px-4 sm:text-sm"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-1.5 h-3.5 w-3.5 opacity-80 sm:mr-2 sm:h-4 sm:w-4" />
                    Share view
                  </Button>
                </div>
                {(searchQuery || selectedTag || venue !== 'all' || language !== 'all') && (
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResetKey((k) => k + 1);
                      setSelectedTag(null);
                      setVenue('all');
                      setLanguage('all');
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          {filteredEvents.length > 0 ? (
            gridEvents.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {gridEvents.map((event, index) => (
                  <EventsLuxuryEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    formatDateShort={formatDateShort}
                    onOpen={() => handleEventOpen(event.slug)}
                    onAddToCalendar={() => handleAddOneToCalendar(event)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                The highlighted gathering above is the only one matching your filters.
              </p>
            )
          ) : (
            <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-primary/20 bg-muted/30 px-8 py-16 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
              <h3 className="mt-6 font-display text-2xl font-light text-foreground">No events in this view</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? 'Try another keyword or clear the search.'
                  : 'Try another tab, topic, or venue filter.'}
              </p>
              <Button className="mt-8 rounded-xl" onClick={() => handleCategoryChange('all')}>
                Show all events
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};
