import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Globe2,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import type { Event, EventCategory } from '@/pages/events/types';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { HeroStatCountUp, HeroStatDateReveal, HeroStatTextReveal } from '@/pages/events/components/HeroStatMotion';
import { formatEventDateRange } from '@/pages/events/utils/eventCategorization';
import { formatLocationLine } from '@/pages/events/utils/eventDetailFormatters';
import { useTranslation } from '@/lib/i18n';
import { GURUDEV_BIRTHDAY_FULLBLEED_HERO_URL } from '@/pages/events/constants';

function categoryLabel(c: EventCategory): string {
  if (c === 'upcoming') return 'Upcoming';
  if (c === 'ongoing') return 'Now live';
  return 'Archive';
}

type Props = {
  event: Event;
  effective: EventCategory;
  onOpenParticipate: () => void;
  onOpenRegisterInterest: () => void;
};

export function GurudevBirthdayHero({ event, effective, onOpenParticipate, onOpenRegisterInterest }: Props) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const container = React.useMemo(
    () =>
      reduceMotion
        ? {
            hidden: { opacity: 1 },
            show: { opacity: 1, transition: { staggerChildren: 0 } },
          }
        : {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.07, delayChildren: 0.06 },
            },
          },
    [reduceMotion]
  );

  const item = React.useMemo(
    () =>
      reduceMotion
        ? {
            hidden: { opacity: 1, y: 0 },
            show: { opacity: 1, y: 0, transition: { duration: 0 } },
          }
        : {
            hidden: { opacity: 0, y: 16 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
            },
          },
    [reduceMotion]
  );

  /** Shorter hero: extra height trimmed from the bottom (justify-start + low pb). */
  const heroMinH =
    'min-h-[calc(100dvh-15rem)] sm:min-h-[calc(100dvh-14.5rem)] lg:min-h-[calc(100dvh-11rem)]';

  return (
    <header className={cn('relative isolate flex min-h-0 flex-col overflow-x-hidden overflow-y-visible', heroMinH)}>
      {/* Full-page background (single image, edge to edge) */}
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full min-w-full [contain:paint]">
        {/* Zoom + anchor right so Gurudev stays clear on the right */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={GURUDEV_BIRTHDAY_FULLBLEED_HERO_URL}
            alt=""
            className="absolute inset-0 z-0 block h-full w-full max-w-none object-cover brightness-[1.06] contrast-[1.06] saturate-[1.07]"
            style={{
              objectFit: 'cover',
              objectPosition: '0% 42%',
              transform: 'scale(1.14)',
              transformOrigin: '2% 42%',
            }}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Blur: text zone only — fades out earlier so Gurudev stays crisp on the right */}
        <div
          className="absolute inset-0 z-[1] backdrop-blur-[18px] backdrop-saturate-[1.08] sm:backdrop-blur-[14px]"
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 18%, rgba(0,0,0,0.38) 42%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0) 78%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.78) 18%, rgba(0,0,0,0.38) 42%, rgba(0,0,0,0.06) 62%, rgba(0,0,0,0) 78%)',
          }}
          aria-hidden
        />
        {/* Premium glass sheen — left-biased only so photo stays clear */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent opacity-80 mix-blend-overlay"
          style={{
            maskImage:
              'linear-gradient(to right, #000 0%, #000 48%, rgba(0,0,0,0.4) 68%, transparent 85%)',
            WebkitMaskImage:
              'linear-gradient(to right, #000 0%, #000 48%, rgba(0,0,0,0.4) 68%, transparent 85%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(45%,320px)] bg-gradient-to-b from-white/[0.06] to-transparent opacity-70"
          style={{
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 55%, transparent 78%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 55%, transparent 78%)',
          }}
          aria-hidden
        />
        {/* Readability: dark left + bottom, lighter toward top-right (photo side stays open) */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0c18]/88 via-[#12152a]/52 to-[#0a0c18]/18 dark:from-[#05060d]/90 dark:via-[hsl(222_32%_10%/0.52)] dark:to-[hsl(230_35%_8%/0.12)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-[#0a0c18]/55 dark:to-[hsl(222_28%_6%/0.65)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_70%_at_70%_35%,transparent_22%,rgba(0,0,0,0.22)_78%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_120%_80%_at_72%_-8%,rgba(251,191,36,0.12),transparent_52%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_55%_at_12%_85%,rgba(59,130,246,0.07),transparent_48%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] opacity-[0.2] mix-blend-soft-light"
          style={{
            backgroundImage: `linear-gradient(125deg, hsl(var(--primary) / 0.26) 0%, transparent 40%, rgba(251,191,36,0.09) 100%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.04)]"
          style={{
            maskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.12) 82%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.12) 82%, transparent 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.12] mix-blend-soft-light"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            maskImage: 'linear-gradient(to right, #000 0%, #000 45%, rgba(0,0,0,0.35) 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 45%, rgba(0,0,0,0.35) 85%, transparent 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            backgroundPosition: '14px 10px',
            maskImage: 'linear-gradient(to right, #000 0%, #000 38%, rgba(0,0,0,0.25) 88%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 38%, rgba(0,0,0,0.25) 88%, transparent 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
      </div>

      {/* Ambient orbs */}
      {!reduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-[15%] top-[10%] z-[2] h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-amber-500/15 blur-[100px]"
            animate={{ opacity: [0.45, 0.65, 0.45], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -right-[10%] bottom-[5%] z-[2] h-[min(50vw,380px)] w-[min(50vw,380px)] rounded-full bg-primary/18 blur-[90px]"
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-2 md:px-6 md:pb-5 md:pt-3">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-x-hidden overflow-y-visible"
        >
          <motion.div
            variants={item}
            className="flex w-full shrink-0 flex-wrap items-center justify-between gap-3 pb-2"
          >
            <Link
              to={ROUTES.EVENTS}
              className="group inline-flex min-w-0 items-center gap-2 text-xs font-medium text-white/85 transition-colors hover:text-white md:text-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/[0.12] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors group-hover:border-white/35 group-hover:bg-white/[0.18] md:h-8 md:w-8">
                <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
              </span>
              <span className="truncate">Back to events</span>
            </Link>
            <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5 md:gap-2">
              <Badge
                className={cn(
                  'shrink-0 border-white/30 bg-white/[0.14] text-white shadow-sm backdrop-blur-md',
                  effective === 'ongoing' && 'border-emerald-400/50 bg-emerald-500/25 text-emerald-50'
                )}
              >
                {categoryLabel(effective)}
              </Badge>
              {event.isAllDay && (
                <span className="shrink-0 rounded-full border border-white/20 bg-white/[0.1] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/75 shadow-sm backdrop-blur-md">
                  All day
                </span>
              )}
            </div>
          </motion.div>

          <div className="relative flex min-h-0 w-full flex-1 flex-col justify-center pb-2">
            <div className="relative z-10 -translate-y-2 flex w-full max-w-[min(100%,42rem)] flex-col gap-2.5 sm:-translate-y-3 md:gap-3">
              <div className="flex w-full flex-col gap-2.5 md:gap-3.5">
              <motion.div variants={item} className="w-full">
                <span className="inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-2.5 py-1 text-[0.48rem] font-semibold uppercase tracking-[0.14em] text-amber-100/95 shadow-[0_0_28px_-6px_rgba(251,191,36,0.4)] backdrop-blur-md sm:gap-2 sm:px-3 sm:text-[0.58rem] sm:tracking-[0.2em]">
                  <Sparkles className="h-3 w-3 shrink-0 text-amber-300 sm:h-3.5 sm:w-3.5" aria-hidden />
                  70th birthday · 45 yrs of The Art of Living · 2026
                </span>
              </motion.div>

              <motion.div variants={item} className="space-y-2 md:space-y-2.5">
                <h1 className="font-display text-[clamp(1.35rem,3.2vw,2.35rem)] font-light leading-[1.06] tracking-tight text-balance text-white">
                  <span className="block text-white/90">Gurudev Sri Sri Ravi Shankar&apos;s</span>
                  <span className="mt-0.5 block bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400/95 bg-clip-text text-[clamp(1.5rem,3.8vw,2.65rem)] font-light text-transparent drop-shadow-[0_2px_24px_rgba(251,191,36,0.22)]">
                    Birthday Celebration
                  </span>
                </h1>
                <p className="line-clamp-2 max-w-lg text-xs font-medium leading-snug text-amber-100/88 md:text-sm">
                  70th birthday · 45 years of The Art of Living — meditation, satsang & seva worldwide. Full details below.
                </p>
              </motion.div>

              <motion.div
                variants={item}
                className="grid w-full max-w-[min(100%,22rem)] grid-cols-2 gap-2 sm:max-w-[min(100%,26rem)] md:gap-2.5 lg:max-w-[min(100%,30rem)] xl:max-w-[min(100%,40rem)] xl:grid-cols-4"
              >
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 backdrop-blur-sm md:p-3">
                  <div className="flex items-center gap-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/60 md:text-[0.55rem] md:tracking-[0.2em]">
                    <Calendar className="h-3 w-3 shrink-0 text-amber-300/90 md:h-3.5 md:w-3.5" aria-hidden />
                    When
                  </div>
                  <HeroStatDateReveal
                    text={formatEventDateRange(event)}
                    className="mt-1 text-[0.7rem] font-medium leading-tight text-white/95 md:text-xs"
                  />
                </div>
                <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 backdrop-blur-sm md:p-3">
                  <div className="flex items-center gap-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/60 md:text-[0.55rem] md:tracking-[0.2em]">
                    <MapPin className="h-3 w-3 shrink-0 text-amber-300/90 md:h-3.5 md:w-3.5" aria-hidden />
                    Where
                  </div>
                  <HeroStatTextReveal
                    text={formatLocationLine(event)}
                    className="mt-1 line-clamp-2 text-[0.7rem] font-medium leading-tight text-white/95 md:text-xs"
                  />
                </div>
                {event.stats?.attendees != null && (
                  <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 backdrop-blur-sm md:p-3">
                    <div className="flex items-center gap-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/60 md:text-[0.55rem] md:tracking-[0.2em]">
                      <Users className="h-3 w-3 shrink-0 text-amber-300/90 md:h-3.5 md:w-3.5" aria-hidden />
                      Reach
                    </div>
                    <p className="mt-1 text-[0.7rem] font-medium leading-tight text-white/95 md:text-xs">
                      <HeroStatCountUp
                        end={event.stats.attendees / 100_000}
                        decimals={
                          (event.stats.attendees / 100_000) % 1 === 0 ? 0 : 1
                        }
                        suffix=" lakh+ expected"
                      />
                    </p>
                  </div>
                )}
                {event.stats?.countries != null && (
                  <div className="rounded-lg border border-white/15 bg-white/[0.06] p-2.5 backdrop-blur-sm md:p-3">
                    <div className="flex items-center gap-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/60 md:text-[0.55rem] md:tracking-[0.2em]">
                      <Globe2 className="h-3 w-3 shrink-0 text-amber-300/90 md:h-3.5 md:w-3.5" aria-hidden />
                      World
                    </div>
                    <p className="mt-1 text-[0.7rem] font-medium leading-tight text-white/95 md:text-xs">
                      <HeroStatCountUp end={event.stats.countries} suffix="+ countries" />
                    </p>
                  </div>
                )}
              </motion.div>

              {(effective === 'upcoming' || effective === 'ongoing') && (
                <motion.div variants={item} className="w-full max-w-[20rem] space-y-2">
                  <p className="text-[0.5rem] font-semibold uppercase leading-tight tracking-[0.2em] text-white/60">
                    {effective === 'upcoming' ? t('home.hero.countdownHeadingStart') : t('home.hero.countdownHeadingEnd')}
                  </p>
                  <div className="w-full">
                    <EventCountdown
                      targetIso={effective === 'upcoming' ? event.startDate : event.endDate}
                      accessibilityLabel={
                        effective === 'upcoming'
                          ? t('home.hero.countdownAriaStart')
                          : t('home.hero.countdownAriaEnd')
                      }
                      size="xs"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={item} className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  type="button"
                  size="default"
                  className="h-9 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 text-sm font-semibold text-amber-950 shadow-[0_8px_32px_-10px_rgba(245,158,11,0.55),inset_0_1px_0_0_rgba(255,255,255,0.25)] ring-1 ring-amber-300/40 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 dark:text-amber-950 md:h-10 md:px-7"
                  onClick={onOpenParticipate}
                >
                  {event.cta.label}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                  type="button"
                  size="default"
                  variant="outline"
                  className="h-9 rounded-full border-white/35 bg-white/[0.12] px-6 text-sm font-semibold text-white shadow-[0_4px_24px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl hover:bg-white/[0.18] md:h-10 md:px-7"
                  onClick={onOpenRegisterInterest}
                >
                  Register interest
                </Button>
              </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-background to-transparent dark:from-[hsl(222_24%_6%)] md:h-6"
        aria-hidden
      />
    </header>
  );
}
