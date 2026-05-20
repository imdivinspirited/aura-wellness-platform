import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarPlus,
  Globe,
  MapPin,
  Tag,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/SafeImage';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import {
  formatEventDateRange,
  getEffectiveCategory,
} from '@/pages/events/utils/eventCategorization';
import type { Event } from '@/pages/events/types';

type Props = {
  event: Event;
  index: number;
  formatDateShort: (iso: string) => string;
  onOpen: () => void;
  onAddToCalendar: () => void;
};

export function EventsLuxuryEventCard({
  event,
  index,
  formatDateShort,
  onOpen,
  onAddToCalendar,
}: Props) {
  const cat = getEffectiveCategory(event);
  const showTimer = cat === 'upcoming' || cat === 'ongoing';

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-card shadow-[0_24px_70px_-50px_rgba(15,23,42,0.35)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_36px_90px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:shadow-[0_32px_80px_-52px_rgba(0,0,0,0.75)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SafeImage
          category="events"
          src={event.media.thumbnail || event.media.banner}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="border border-white/10 bg-background/85 text-[0.65rem] font-semibold uppercase tracking-wider backdrop-blur-md"
          >
            {cat === 'upcoming' && 'Upcoming'}
            {cat === 'ongoing' && 'Live window'}
            {cat === 'past' && 'Archive'}
          </Badge>
          {event.tags?.slice(0, 2).map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="border-primary/20 bg-primary/[0.07] text-[0.6rem] font-medium uppercase tracking-wide text-foreground backdrop-blur-sm"
            >
              <Tag className="mr-1 h-2.5 w-2.5 opacity-70" aria-hidden />
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-5">
        <h3 className="font-display text-xl font-light leading-snug tracking-tight text-foreground line-clamp-2">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {event.shortDescription || event.description}
        </p>

        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CalendarPlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{formatEventDateRange(event)}</span>
          </div>
          <div className="flex items-start gap-2">
            {event.location.online ? (
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            )}
            <span className="line-clamp-2">
              {event.location.online
                ? event.location.hybrid
                  ? 'Hybrid — campus & online'
                  : 'Online'
                : event.location.name || event.location.city}
            </span>
          </div>
          {event.stats?.attendees != null && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                {event.stats.attendees >= 1_000_000
                  ? `${(event.stats.attendees / 1_000_000).toFixed(1)}M`
                  : event.stats.attendees >= 1000
                    ? `${(event.stats.attendees / 1000).toFixed(1)}K`
                    : event.stats.attendees}{' '}
                expected participants
              </span>
            </div>
          )}
        </div>

        {showTimer && (
          <div className="mt-5 rounded-2xl border border-primary/12 bg-gradient-to-br from-primary/[0.06] to-transparent p-3 dark:from-primary/10">
            <p className="mb-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {cat === 'ongoing' ? 'Closing in' : 'Starts in'}
            </p>
            <EventCountdown
              targetIso={cat === 'ongoing' ? event.endDate : event.startDate}
              accessibilityLabel={cat === 'ongoing' ? 'Time until event ends' : 'Time until event starts'}
              size="sm"
            />
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button className="flex-1 min-w-[140px] rounded-xl" onClick={onOpen}>
            Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="default"
            className="rounded-xl border-primary/20"
            onClick={onAddToCalendar}
            aria-label={`Download calendar file for ${event.title}`}
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
          <AddToCartButton
            itemId={`event-${event.id}`}
            itemType="application"
            title={event.title}
            subtitle={event.shortDescription || event.description}
            metadata={{
              date: formatDateShort(event.startDate),
              location: event.location.online ? 'Online' : event.location.name,
              category: cat,
            }}
            variant="icon"
            size="default"
            className="rounded-xl"
          />
        </div>
      </div>
    </motion.article>
  );
}
