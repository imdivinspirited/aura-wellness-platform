import { useCallback } from 'react';
import {
  CalendarPlus,
  Copy,
  Globe2,
  MapPin,
  Quote,
  Share2,
  Sparkles,
  Users,
  Youtube,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Event } from '@/pages/events/types';
import { buildEventsIcs, downloadIcsFile } from '@/pages/events/utils/calendarExport';
import { YOUTUBE_CHANNEL_URL } from '@/pages/events/config/eveningSatsang';
import { getAbsoluteSiteUrl } from '@/lib/routes';
import { cn } from '@/lib/utils';

const MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/?api=1&query=Art+of+Living+International+Center+Bangalore+Kanakapura+Road';

/** Format Indian-lakh style for expected reach (e.g. 300_000 → "3 lakh+"). */
function formatLakhReach(n: number): string {
  const lakh = n / 100_000;
  const decimals = lakh % 1 === 0 ? 0 : 1;
  return `${lakh.toFixed(decimals)} lakh+`;
}

type Props = { event: Event };

export function GurudevBirthdayEventSections({ event }: Props) {
  const pageUrl = getAbsoluteSiteUrl(`/events/${event.slug}`);

  const shareOrCopy = useCallback(async () => {
    const payload = {
      title: event.title,
      text: event.shortDescription ?? (event.description ? event.description.slice(0, 280) : ''),
      url: pageUrl,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success('Event link copied');
    } catch {
      toast.error('Could not copy link');
    }
  }, [event.description, event.shortDescription, event.title, pageUrl]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy');
    }
  }, [pageUrl]);

  const downloadCalendar = useCallback(() => {
    const ics = buildEventsIcs([event], event.title);
    downloadIcsFile('gurudev-birthday-2026.ics', ics);
    toast.success('Calendar file ready — open it to add to Apple, Google, or Outlook');
  }, [event]);

  const stats = event.stats;
  const langCount = event.languages?.length ?? 0;

  return (
    <div id="gathering-tools" className="scroll-mt-24 space-y-10 md:scroll-mt-28">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="rounded-full gap-2"
          onClick={shareOrCopy}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full gap-2"
          onClick={copyLink}
        >
          <Copy className="h-4 w-4" aria-hidden />
          Copy link
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full gap-2"
          onClick={downloadCalendar}
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add to calendar
        </Button>
        <Button type="button" size="sm" variant="outline" className="rounded-full gap-2" asChild>
          <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4" aria-hidden />
            Venue map
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className={cn(
            'rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-amber-500/[0.04] p-5 dark:from-primary/10 dark:to-amber-950/20'
          )}
        >
          <Users className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 font-display text-2xl font-light tabular-nums text-foreground">
            {stats?.attendees != null ? formatLakhReach(stats.attendees) : '—'}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Expected people
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <Globe2 className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 font-display text-2xl font-light tabular-nums text-foreground">
            {stats?.countries ?? '—'}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Countries
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 font-display text-2xl font-light tabular-nums text-foreground">
            {langCount || '—'}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Languages
          </p>
        </div>
      </div>

      <figure
        className={cn(
          'relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-amber-50/80 via-background to-primary/[0.06] p-8 dark:from-amber-950/30 dark:via-background dark:to-primary/10'
        )}
      >
        <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/20" aria-hidden />
        <blockquote className="relative max-w-3xl text-lg leading-relaxed text-foreground/95 md:text-xl md:leading-relaxed">
          <p className="font-display font-light italic">
            &ldquo;Every day, do something that will inch you closer to a better tomorrow.&rdquo;
          </p>
        </blockquote>
        <figcaption className="mt-4 text-sm text-muted-foreground">
          — Gurudev Sri Sri Ravi Shankar
        </figcaption>
      </figure>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm dark:border-white/10">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden />
            Follow the day online
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Official live and on-demand coverage from the International Center appears on our YouTube channel
            during the celebration.
          </p>
          <Button className="mt-4 rounded-full gap-2" variant="secondary" size="sm" asChild>
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <Youtube className="h-4 w-4" aria-hidden />
              Art of Living IC on YouTube
            </a>
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-light tracking-tight md:text-2xl">
          Frequently asked
        </h2>
        <Accordion type="single" collapsible className="w-full rounded-2xl border border-border/60 px-4 dark:border-white/10">
          <AccordionItem value="where">
            <AccordionTrigger className="text-left text-sm font-medium md:text-base">
              Where does the main celebration take place?
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              The heart of the programme is at{' '}
              <strong className="font-medium text-foreground">
                The Art of Living International Center, Bangalore
              </strong>
              , with participation across our global sangha and livestreams for those joining remotely.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="online">
            <AccordionTrigger className="text-left text-sm font-medium md:text-base">
              Can I join from outside India?
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              Yes. The day includes worldwide participation through local centres, home practice, and official
              online broadcasts. Check the schedule for session times in your timezone.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="participate">
            <AccordionTrigger className="text-left text-sm font-medium md:text-base">
              How can I participate meaningfully?
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              Join meditations and satsangs in silence where possible, engage in seva where offered, and share
              the spirit of the day with family and friends. Donations on this page support humanitarian
              programmes if you wish to contribute.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
