import { motion } from 'framer-motion';
import { ArrowRight, CalendarPlus, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/SafeImage';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import {
  formatEventDateRange,
  getEffectiveCategory,
} from '@/pages/events/utils/eventCategorization';
import type { Event } from '@/pages/events/types';

type Props = {
  event: Event;
  onOpen: () => void;
  onAddToCalendar: () => void;
};

/**
 * Next gathering spotlight — editorial typography; content column does not scroll internally.
 */
export function EventsHorizonSpotlight({ event, onOpen, onAddToCalendar }: Props) {
  const cat = getEffectiveCategory(event);
  const isLive = cat === 'ongoing';

  const locationLine = event.location.online
    ? event.location.hybrid
      ? 'Hybrid · online or campus'
      : 'Online'
    : [event.location.city, event.location.country].filter(Boolean).join(' · ') || event.location.name;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-full overflow-hidden rounded-[1.75rem] border border-primary/12 bg-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.28)] ring-1 ring-black/[0.04] dark:border-white/10 dark:ring-white/[0.06] dark:shadow-[0_32px_90px_-48px_rgba(0,0,0,0.55)]"
    >
      <div className="grid w-full min-w-0 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
        {/* Visual — fixed min height on large screens so layout stays balanced without inner scroll */}
        <div className="relative h-[200px] w-full min-w-0 sm:h-[240px] lg:h-auto lg:min-h-[min(380px,50vh)]">
          <SafeImage
            category="events"
            src={event.media.thumbnail || event.media.banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/55" />
          {isLive && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-red-400/40 bg-red-600/95 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white shadow-md backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Live
            </div>
          )}
        </div>

        {/* Copy + actions — no internal scroll; card grows with content */}
        <div className="flex min-w-0 flex-col justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6 lg:px-9 lg:py-7">
          <div className="min-w-0 space-y-3">
            <div className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-primary/90">
              <Sparkles className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              <span className="truncate">On the horizon</span>
            </div>

            <h2 className="font-display text-[clamp(1.25rem,2.8vw,1.875rem)] font-light leading-[1.2] tracking-tight text-foreground line-clamp-2 break-words">
              {event.title}
            </h2>

            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:line-clamp-3">
              {event.shortDescription || event.description}
            </p>

            <div className="flex flex-col gap-2 border-t border-primary/10 pt-3 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1 sm:text-[0.8125rem]">
              <span className="inline-flex min-w-0 items-center gap-2">
                <CalendarPlus className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span className="truncate">{formatEventDateRange(event)}</span>
              </span>
              <span className="inline-flex min-w-0 items-start gap-2 sm:max-w-[55%]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span className="line-clamp-2 leading-snug">{locationLine}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 space-y-4 border-t border-primary/10 pt-4">
            <div className="rounded-xl border border-primary/12 bg-gradient-to-br from-primary/[0.06] to-transparent px-3 py-2.5 dark:from-primary/10">
              <p className="mb-2 text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {isLive ? 'Time remaining' : 'Begins in'}
              </p>
              <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <EventCountdown
                  targetIso={isLive ? event.endDate : event.startDate}
                  accessibilityLabel={isLive ? 'Time remaining in event' : 'Time until event starts'}
                  size="sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="default"
                className="w-full shrink-0 rounded-xl px-6 shadow-md shadow-primary/15 sm:w-auto"
                onClick={onOpen}
              >
                Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="default"
                variant="outline"
                className="w-full shrink-0 rounded-xl border-primary/20 bg-background/90 sm:w-auto"
                onClick={onAddToCalendar}
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
