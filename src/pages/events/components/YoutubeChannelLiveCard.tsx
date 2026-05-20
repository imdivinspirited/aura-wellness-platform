import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, ExternalLink, History, Radio, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SmartLink } from '@/components/ui/SmartLink';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChannelBroadcastSnapshot, PastBroadcastItem } from '@/lib/youtube/youtubeChannelBroadcast';
import { getYoutubeEmbedUrl } from '@/lib/youtube/youtubeChannelBroadcast';
import { YOUTUBE_CHANNEL_URL } from '@/pages/events/config/eveningSatsang';
import { useYoutubeChannelBroadcast } from '@/pages/events/hooks/useYoutubeChannelBroadcast';
import { usePastBroadcasts } from '@/pages/events/hooks/usePastBroadcasts';
import type { PastSortOrder } from '@/pages/events/hooks/usePastBroadcasts';
import { cn } from '@/lib/utils';

function truncateText(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

type Variant = 'full' | 'compact';

/**
 * When the Data API reports no live/upcoming stream, we show this — not the legacy
 * `embed/live_stream?channel=` player, which shows YouTube’s “Video unavailable” between broadcasts.
 * When a stream is live or scheduled, {@link YoutubeChannelLiveCardInner} replaces this (requires API access).
 */
function ChannelLiveFallback({ variant }: { variant: Variant }) {
  const isCompact = variant === 'compact';
  return (
    <Card
      className={cn(
        'w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-[0_20px_60px_-40px_rgba(0,0,0,0.2)]',
        isCompact && 'shadow-md'
      )}
    >
      <CardContent className={cn('p-5', isCompact && 'p-4 pb-8')}>
        <div
          className={cn(
            'min-w-0',
            !isCompact && 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8'
          )}
        >
          <div className={cn('space-y-3', !isCompact && 'lg:py-1')}>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Art of Living International Center
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Live programmes and scheduled streams from the Center appear here when available. Between
              broadcasts, use <strong className="font-medium text-foreground">Open channel</strong> to watch on
              YouTube.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size={isCompact ? 'default' : 'lg'} className="rounded-xl">
                <SmartLink to={YOUTUBE_CHANNEL_URL} openInNewTab>
                  <Youtube className="mr-2 h-4 w-4" aria-hidden />
                  Open channel
                  <ExternalLink className="ml-2 h-3 w-3 opacity-70" aria-hidden />
                </SmartLink>
              </Button>
            </div>
          </div>
          <div
            className={cn(
              'relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-muted/60 via-muted/30 to-primary/5',
              isCompact ? 'mt-10 min-h-[140px]' : 'mt-5 lg:mt-0'
            )}
            aria-hidden
          >
            <Radio className={cn('text-primary/40', isCompact ? 'h-8 w-8' : 'h-12 w-12')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPublished(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function filterPastByDateRange(
  list: PastBroadcastItem[],
  from: string,
  to: string
): PastBroadcastItem[] {
  if (!from && !to) return list;
  return list.filter((row) => {
    const t = new Date(row.publishedAt).getTime();
    if (from) {
      const start = new Date(`${from}T00:00:00.000`).getTime();
      if (t < start) return false;
    }
    if (to) {
      const end = new Date(`${to}T23:59:59.999`).getTime();
      if (t > end) return false;
    }
    return true;
  });
}

const PAST_LIST_MORE_STEP = 5;
const PAST_INITIAL_VISIBLE = 3;

function initialPastVisibleCount() {
  return PAST_INITIAL_VISIBLE;
}

function PastBroadcastsPanel({
  variant,
  enabled,
}: {
  variant: Variant;
  enabled: boolean;
}) {
  const isCompact = variant === 'compact';
  const {
    items,
    loading,
    errorMessage,
    usedUploadsFallback,
    sortOrder,
    setSortOrder,
    refresh,
  } = usePastBroadcasts(enabled);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filteredItems = useMemo(
    () => filterPastByDateRange(items, dateFrom, dateTo),
    [items, dateFrom, dateTo]
  );
  const dateFilterActive = Boolean(dateFrom || dateTo);

  const [pastVisibleCount, setPastVisibleCount] = useState(() => initialPastVisibleCount());
  const [expandedPastVideoId, setExpandedPastVideoId] = useState<string | null>(null);

  useEffect(() => {
    setPastVisibleCount(initialPastVisibleCount());
    setExpandedPastVideoId(null);
  }, [dateFrom, dateTo, sortOrder]);

  const visiblePastItems = useMemo(
    () => filteredItems.slice(0, pastVisibleCount),
    [filteredItems, pastVisibleCount]
  );
  const hasMorePast = pastVisibleCount < filteredItems.length;
  const remainingPast = filteredItems.length - pastVisibleCount;
  const canCollapsePastList = pastVisibleCount > PAST_INITIAL_VISIBLE;

  return (
    <Card className="overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-md">
      <CardContent className={cn('p-5', isCompact && 'p-4')}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <History className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className={cn('text-sm', isCompact && 'text-xs')}>
              {usedUploadsFallback
                ? 'Recent channel videos (YouTube often omits completed-live search)'
                : 'Completed live streams (when YouTube lists them for this channel)'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as PastSortOrder)}
            >
              <SelectTrigger
                className={cn(
                  'h-9 w-[200px] rounded-xl border-primary/15',
                  isCompact && 'h-8 w-full max-w-[200px] text-xs'
                )}
                aria-label="Sort by date"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Date · newest first</SelectItem>
                <SelectItem value="oldest">Date · oldest first</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => refresh()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {items.length > 0 && !loading ? (
          <div
            className={cn(
              'mb-4 flex flex-col gap-3 rounded-2xl border border-primary/10 bg-muted/25 p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4'
            )}
          >
            <div className="space-y-1.5">
              <Label htmlFor={`past-from-${variant}`} className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id={`past-from-${variant}`}
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn('rounded-xl border-primary/15', isCompact ? 'h-8 text-xs' : 'h-9 w-full sm:w-[168px]')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`past-to-${variant}`} className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id={`past-to-${variant}`}
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn('rounded-xl border-primary/15', isCompact ? 'h-8 text-xs' : 'h-9 w-full sm:w-[168px]')}
              />
            </div>
            {dateFilterActive ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear dates
              </Button>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading archive…</p>
        ) : errorMessage && items.length === 0 ? (
          <div className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Could not load past content</p>
            <p className="whitespace-pre-wrap text-destructive/90">{errorMessage}</p>
            <p className="text-muted-foreground">
              Use <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_YOUTUBE_API_KEY</code> in the
              project root <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>, or{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">YOUTUBE_API_KEY</code> in{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">backend/.env</code>, enable YouTube Data
              API v3, ensure quota — then restart and try Refresh.
            </p>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed live streams returned for this channel yet — check again after streams end, or
            open the channel on YouTube.
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No videos match the selected dates. Adjust the date range or clear dates.
          </p>
        ) : (
          <div className="space-y-3">
            {usedUploadsFallback ? (
              <p className="rounded-2xl border border-primary/15 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Showing recent videos from the channel (uploads search or public feed). YouTube&apos;s
                &quot;completed&quot; live filter often returns nothing, so we use uploads or the channel RSS
                feed instead — no Google API key required for the feed.
              </p>
            ) : null}
            {dateFilterActive ? (
              <p className="text-xs text-muted-foreground">
                Showing {filteredItems.length} of {items.length} (date filter on)
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Tap a row to play on this page.
              {filteredItems.length > PAST_INITIAL_VISIBLE ? (
                <>
                  {' '}
                  Showing {visiblePastItems.length} of {filteredItems.length}. Use More or Show less.
                </>
              ) : null}
            </p>
            <ul
              className={cn(
                'max-h-[min(520px,65vh)] space-y-2 overflow-y-auto pr-1',
                isCompact && 'max-h-[min(360px,50vh)]'
              )}
            >
              {visiblePastItems.map((row) => {
                const youtubeHref = `https://www.youtube.com/watch?v=${row.videoId}`;
                const open = expandedPastVideoId === row.videoId;
                return (
                  <li
                    key={row.videoId}
                    className="overflow-hidden rounded-2xl border border-primary/10 bg-muted/20 transition-colors hover:bg-muted/35"
                  >
                    <button
                      type="button"
                      className="flex w-full gap-3 p-2 text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      aria-expanded={open}
                      onClick={() =>
                        setExpandedPastVideoId((id) => (id === row.videoId ? null : row.videoId))
                      }
                    >
                      {row.thumbnailUrl ? (
                        <img
                          src={row.thumbnailUrl}
                          alt=""
                          className="h-16 w-28 shrink-0 rounded-lg object-cover sm:h-[4.5rem] sm:w-32"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-[4.5rem] sm:w-32">
                          <Youtube className="h-6 w-6 text-muted-foreground/50" aria-hidden />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="line-clamp-2 font-medium leading-snug text-foreground text-sm sm:text-base">
                          {row.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                          {formatPublished(row.publishedAt)}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                          open && 'rotate-180'
                        )}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <div className="space-y-3 border-t border-primary/10 bg-background/40 px-2 pb-3 pt-3 sm:px-3">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/15 bg-black">
                          <iframe
                            src={getYoutubeEmbedUrl(row.videoId)}
                            title={row.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <a
                          href={youtubeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Open on YouTube
                          <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
                        </a>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {hasMorePast ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl sm:flex-1"
                  onClick={() =>
                    setPastVisibleCount((c) =>
                      Math.min(c + PAST_LIST_MORE_STEP, filteredItems.length)
                    )
                  }
                >
                  More
                  {remainingPast > 0 ? (
                    <span className="ml-1 text-muted-foreground">({remainingPast} more)</span>
                  ) : null}
                </Button>
              ) : null}
              {canCollapsePastList ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl text-muted-foreground sm:flex-1"
                  onClick={() => {
                    setPastVisibleCount(PAST_INITIAL_VISIBLE);
                    setExpandedPastVideoId(null);
                  }}
                >
                  Show less
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelStreamToolbar({
  view,
  onViewChange,
}: {
  view: 'current' | 'past';
  onViewChange: (v: 'current' | 'past') => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-primary/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Art of Living International Center · YouTube
        </p>
        <h2 className="mt-1 font-display text-2xl font-light tracking-tight text-foreground md:text-3xl">
          Channel live stream
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === 'current' ? 'default' : 'outline'}
          className="rounded-full px-5"
          onClick={() => onViewChange('current')}
        >
          Current
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === 'past' ? 'default' : 'outline'}
          className="rounded-full px-5"
          onClick={() => onViewChange('past')}
        >
          <History className="mr-2 h-4 w-4" aria-hidden />
          Past
        </Button>
      </div>
    </div>
  );
}

function YoutubeChannelLiveCardInner({
  variant = 'full',
  snapshot,
}: {
  variant?: Variant;
  snapshot: Exclude<ChannelBroadcastSnapshot, { kind: 'idle' }>;
}) {
  const isCompact = variant === 'compact';
  const watchUrl = `https://www.youtube.com/watch?v=${snapshot.videoId}`;

  return (
    <Card
      className={cn(
        'w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-card via-card to-secondary/[0.06] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.2)]',
        isCompact && 'shadow-md'
      )}
    >
      <CardContent className="p-0">
        <div
          className={cn(
            'grid min-w-0 gap-0',
            !isCompact && 'lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]'
          )}
        >
          {/* Content: title + description + countdown only — live/scheduled status appears on the preview side */}
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-col justify-center border-b border-primary/10 bg-card/40 p-5',
              isCompact && 'p-4'
            )}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Art of Living International Center
            </p>
            <h3
              className={cn(
                'mt-3 font-display font-light leading-snug tracking-tight text-foreground',
                isCompact ? 'text-lg' : 'text-xl md:text-2xl'
              )}
            >
              {snapshot.title}
            </h3>
            {snapshot.description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-[8] sm:line-clamp-6">
                {truncateText(snapshot.description, isCompact ? 220 : 520)}
              </p>
            ) : null}
            {snapshot.kind === 'scheduled' ? (
              <div className="mt-5 rounded-2xl border border-primary/15 bg-muted/25 p-4">
                <p className="mb-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Starts in
                </p>
                <EventCountdown
                  targetIso={snapshot.scheduledStartTime}
                  accessibilityLabel="Time until scheduled live stream"
                  size={isCompact ? 'sm' : 'md'}
                />
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              'flex min-h-0 min-w-0 w-full flex-col gap-4 border-t border-primary/10 p-5',
              isCompact && 'p-4',
              !isCompact && 'lg:border-l lg:border-t-0'
            )}
          >
            {snapshot.kind === 'live' ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/40 bg-red-600 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live
              </div>
            ) : (
              <div className="inline-flex w-fit rounded-full border border-primary/30 bg-muted/40 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary">
                Scheduled live
              </div>
            )}
            <div className="relative isolate aspect-video w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-black shadow-inner">
              <iframe
                src={getYoutubeEmbedUrl(snapshot.videoId)}
                title={snapshot.title}
                className="absolute inset-0 h-full w-full max-w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {snapshot.kind === 'scheduled' ? (
              <p className="text-center text-xs text-muted-foreground">
                YouTube may show a countdown or “waiting for premiere” until the stream starts.
              </p>
            ) : null}

            <div
              className={cn(
                'flex w-full min-w-0 gap-2 pt-1',
                isCompact ? 'flex-col' : 'flex-wrap'
              )}
            >
              <Button
                asChild
                size={isCompact ? 'default' : 'lg'}
                className={cn('rounded-xl', isCompact && 'w-full justify-center')}
              >
                <SmartLink to={watchUrl} openInNewTab>
                  <Youtube className="mr-2 h-4 w-4" aria-hidden />
                  Open on YouTube
                  <ExternalLink className="ml-2 h-3 w-3 opacity-70" aria-hidden />
                </SmartLink>
              </Button>
              <Button
                asChild
                variant="outline"
                size={isCompact ? 'default' : 'lg'}
                className={cn('rounded-xl border-primary/25', isCompact && 'w-full justify-center')}
              >
                <SmartLink to={YOUTUBE_CHANNEL_URL} openInNewTab>
                  Channel
                  <ExternalLink className="ml-2 h-3 w-3 opacity-70" aria-hidden />
                </SmartLink>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Events listing: always shows live block — rich metadata when API reports live/scheduled, else channel embed.
 */
export function YoutubeChannelLiveSection() {
  const [view, setView] = useState<'current' | 'past'>('current');
  const { snapshot, loading } = useYoutubeChannelBroadcast();

  const rich = !loading && snapshot.kind !== 'idle';

  return (
    <section className="border-b border-primary/10 bg-[hsl(50_28%_97%)] py-10 dark:bg-background">
      <div className="container space-y-5">
        <ChannelStreamToolbar view={view} onViewChange={setView} />

        {view === 'past' ? (
          <PastBroadcastsPanel variant="full" enabled={view === 'past'} />
        ) : (
          <>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Checking YouTube for scheduled or live broadcasts…
              </p>
            ) : null}
            {rich ? (
              <YoutubeChannelLiveCardInner variant="full" snapshot={snapshot} />
            ) : (
              <ChannelLiveFallback variant="full" />
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Event detail sidebar: compact live block — same logic as listing.
 */
export function YoutubeChannelLiveAside() {
  const [view, setView] = useState<'current' | 'past'>('current');
  const { snapshot, loading } = useYoutubeChannelBroadcast();

  const rich = !loading && snapshot.kind !== 'idle';

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
      <div className="space-y-2">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          YouTube · IC
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === 'current' ? 'default' : 'outline'}
            className="flex-1 rounded-full text-xs"
            onClick={() => setView('current')}
          >
            Current
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'past' ? 'default' : 'outline'}
            className="flex-1 rounded-full text-xs"
            onClick={() => setView('past')}
          >
            Past
          </Button>
        </div>
      </div>

      {view === 'past' ? (
        <PastBroadcastsPanel variant="compact" enabled={view === 'past'} />
      ) : (
        <>
          {loading ? (
            <p className="text-xs text-muted-foreground">Checking YouTube…</p>
          ) : null}
          {rich ? (
            <YoutubeChannelLiveCardInner variant="compact" snapshot={snapshot} />
          ) : (
            <ChannelLiveFallback variant="compact" />
          )}
        </>
      )}
    </div>
  );
}
