import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Calendar,
  MapPin,
  Sparkles,
  Globe2,
  Heart,
  History,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { VideoModal } from '@/components/ui/video-modal';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/lib/i18n';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import { getAllEventsSync } from '@/pages/events/services/eventService';
import { FEATURED_HERO_EVENT_ID, GURUDEV_BIRTHDAY_CARD_IMAGE_URL } from '@/pages/events/constants';
import { formatEventDateRange, getEffectiveCategory } from '@/pages/events/utils/eventCategorization';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import { useEventsClock } from '@/pages/events/hooks/useEventsClock';

function useAnimatedStat(target: number, durationMs: number, animate: boolean) {
  const [n, setN] = useState(animate ? 0 : target);

  useEffect(() => {
    if (!animate || durationMs <= 0) {
      setN(target);
      return;
    }
    setN(0);
    let cancelled = false;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, animate]);

  return n;
}

type HeroStatItemProps = {
  end: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  delay: number;
  reduceMotion: boolean;
  compact?: boolean;
};

function HeroStatItem({ end, suffix, label, icon: Icon, delay, reduceMotion, compact }: HeroStatItemProps) {
  const n = useAnimatedStat(end, 1900, !reduceMotion);
  const display = reduceMotion ? end : n;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative min-w-0 w-full rounded-2xl border border-border/45 bg-gradient-to-b from-background/80 via-background/55 to-background/40 shadow-[0_12px_40px_-28px_hsl(var(--foreground)/0.18)] backdrop-blur-md',
        'dark:border-white/12 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-transparent dark:shadow-[0_16px_48px_-32px_rgba(0,0,0,0.55)]',
        'max-md:flex max-md:flex-row max-md:items-center max-md:gap-3 max-md:text-left md:flex-col md:items-center md:text-center',
        compact ? 'px-2 py-2.5 md:px-2 md:py-3' : 'px-3 py-4 md:px-2 md:py-4'
      )}
    >
      {!reduceMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-amber-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
      )}
      <motion.span
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.12] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
          'dark:bg-primary/15',
          compact ? 'h-8 w-8 md:h-9 md:w-9' : 'h-10 w-10 md:h-11 md:w-11'
        )}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      >
        <Icon
          className={cn(compact ? 'h-3.5 w-3.5 md:h-4 md:w-4' : 'h-[1.15rem] w-[1.15rem] md:h-5 md:w-5')}
          strokeWidth={1.5}
          aria-hidden
        />
      </motion.span>
      <div className="relative min-w-0 flex-1 md:w-full md:flex-none">
        <p
          className={cn(
            'font-display font-semibold leading-none tracking-tight text-foreground tabular-nums dark:text-white',
            compact
              ? 'text-lg sm:text-xl md:text-[1.2rem] lg:text-xl'
              : 'text-xl sm:text-2xl md:text-[1.375rem] lg:text-2xl'
          )}
          aria-label={`${display}${suffix} ${label}`}
        >
          <span className="inline-block">{display}</span>
          <span className="inline-block text-primary dark:text-[hsl(var(--primary))]">{suffix}</span>
        </p>
        <p
          className={cn(
            'mt-1.5 font-semibold uppercase leading-snug text-muted-foreground md:mx-auto md:max-w-[12.5rem]',
            compact ? 'text-[0.55rem] tracking-[0.12em]' : 'text-[0.6rem] tracking-[0.16em]'
          )}
        >
          {label}
        </p>
      </div>
      <span
        className="pointer-events-none absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-70 max-md:hidden md:left-3 md:right-3"
        aria-hidden
      />
    </motion.div>
  );
}

export const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const systemReduce = useReducedMotion();
  const prefReduce = useUserStore((s) => s.appearance.reduceMotion);
  const reduceMotion = systemReduce || prefReduce;
  const eventsClock = useEventsClock(30_000);

  const spotlightEvent = useMemo(
    () => getAllEventsSync().find((e) => e.id === FEATURED_HERO_EVENT_ID),
    [eventsClock]
  );
  const spotlightCategory = spotlightEvent ? getEffectiveCategory(spotlightEvent) : null;

  const handleExplorePrograms = () => {
    navigate(ROUTES.PROGRAMS);
  };

  const handleWatchVideo = () => {
    setVideoModalOpen(true);
  };

  const handleRegisterNow = () => {
    window.location.href = ROUTES.REGISTRATION;
  };

  const featuredCard =
    spotlightEvent && spotlightCategory ? (
      <Card
        className={cn(
          'overflow-hidden border border-white/25 bg-white/75 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[hsl(210_22%_12%/0.72)]',
          'ring-1 ring-black/[0.04] dark:ring-white/10'
        )}
      >
        <div className="relative h-40 overflow-hidden sm:h-44 md:h-48 lg:h-[12.5rem]">
          <img
            src={
              spotlightEvent.media.thumbnail ||
              spotlightEvent.media.banner ||
              GURUDEV_BIRTHDAY_CARD_IMAGE_URL
            }
            alt={spotlightEvent.title}
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 ease-out [transform-origin:50%_40%]',
              'object-[center_42%] sm:object-[center_38%] md:object-[center_36%] lg:object-[center_34%]',
              'hover:scale-[1.03]',
            )}
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent dark:from-[hsl(210_25%_8%/0.92)] dark:via-transparent dark:to-transparent"
            aria-hidden
          />
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{t('home.hero.cardFeatured')}</span>
          </div>
          <h3 className="mb-1 font-display text-lg font-semibold tracking-tight text-balance">{spotlightEvent.title}</h3>
          <p className="mb-2 text-xs leading-snug text-muted-foreground sm:text-sm line-clamp-3">
            {spotlightEvent.shortDescription || spotlightEvent.description}
          </p>

          {(spotlightCategory === 'upcoming' || spotlightCategory === 'ongoing') && (
            <div className="mb-2 rounded-lg border border-primary/20 bg-primary/[0.06] p-1.5 sm:p-2 dark:bg-primary/10">
              <p className="mb-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.52rem]">
                {spotlightCategory === 'upcoming' ? t('home.hero.countdownHeadingStart') : t('home.hero.countdownHeadingEnd')}
              </p>
              <EventCountdown
                targetIso={spotlightCategory === 'upcoming' ? spotlightEvent.startDate : spotlightEvent.endDate}
                accessibilityLabel={
                  spotlightCategory === 'upcoming'
                    ? t('home.hero.countdownAriaStart')
                    : t('home.hero.countdownAriaEnd')
                }
                size="xs"
              />
            </div>
          )}

          {spotlightCategory === 'ongoing' && (
            <p className="mb-2 text-xs font-medium text-primary">{t('home.hero.featuredEventLive')}</p>
          )}

          <div className="mb-2 space-y-1 border-t border-border/50 pt-2 text-xs text-muted-foreground sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <span>{formatEventDateRange(spotlightEvent)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <span>
                {spotlightEvent.location.hybrid
                  ? 'Bangalore & global webcast'
                  : spotlightEvent.location.online
                    ? 'Global — online'
                    : [spotlightEvent.location.name, spotlightEvent.location.city].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <Button className="h-10 flex-1 rounded-xl font-semibold shadow-md shadow-primary/15" size="sm" asChild>
              <Link
                to={ROUTES.eventDetail(spotlightEvent.slug)}
                className="inline-flex items-center justify-center gap-0"
              >
                {spotlightCategory === 'past' ? t('home.hero.featuredEventConcluded') : t('home.hero.featuredEventCta')}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-xl border-2 font-semibold"
              size="sm"
              onClick={handleRegisterNow}
            >
              {t('home.hero.featuredEventSecondary')}
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card
        className={cn(
          'overflow-hidden border border-white/25 bg-white/75 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[hsl(210_22%_12%/0.72)]',
          'ring-1 ring-black/[0.04] dark:ring-white/10'
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-muted-foreground">{t('home.hero.cardFeatured')}</p>
          <Button className="mt-4 w-full rounded-xl" asChild>
            <Link to={ROUTES.EVENTS_UPCOMING}>{t('home.upcomingEvents.viewAll')}</Link>
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <section
      id="aol-page-hero"
      className="relative flex min-h-[calc(100dvh-5.25rem)] flex-col overflow-hidden lg:min-h-[calc(100dvh-4rem)]"
      aria-label={t('home.hero.sectionAria')}
    >
      {/* Background stack */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className={cn('relative h-full w-full overflow-hidden', !reduceMotion && 'animate-home-ken-burns')}
          initial={false}
        >
          <picture>
            <source
              type="image/webp"
              srcSet="/images/hero/hero_landing_ashram_mobile.webp 768w, /images/hero/hero_landing_ashram.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/images/hero/hero_landing_ashram_mobile.jpg"
              srcSet="/images/hero/hero_landing_ashram_mobile.jpg 768w, /images/hero/hero_landing_ashram.jpg 1920w"
              sizes="100vw"
              alt={t('home.hero.imgAshramAlt')}
              className="h-full min-h-[100svh] w-full object-cover object-[center_22%]"
              loading="eager"
              fetchPriority="high"
              width={1920}
              height={1080}
            />
          </picture>
        </motion.div>
        <canvas
          id="aol-hero-particles"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-90"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-br from-background/95 via-background/55 to-background/25 dark:from-[hsl(210_28%_8%/0.92)] dark:via-[hsl(210_25%_10%/0.55)] dark:to-[hsl(210_22%_12%/0.35)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/25 to-transparent dark:from-[hsl(210_25%_8%)] dark:via-transparent dark:to-[hsl(210_28%_6%/0.4)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[3] opacity-[0.35] mix-blend-overlay dark:opacity-[0.2]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
            backgroundSize: '220px 220px',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-background to-transparent dark:from-[hsl(210_25%_8%)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 container flex min-h-0 flex-1 flex-col justify-start px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-6 md:pt-7 lg:max-h-[calc(100dvh-4rem)] lg:justify-center lg:px-8 lg:py-3">
        <div className="grid w-full min-h-0 items-start gap-6 lg:grid-cols-12 lg:items-center lg:gap-6 xl:gap-10">
          <div className="order-1 min-w-0 space-y-4 sm:space-y-4 lg:col-span-7 lg:space-y-4 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-primary/90">
                {t('home.hero.lineage')}
              </p>
              <Badge className="inline-flex border-primary/30 bg-primary/12 py-1 pl-2 pr-3 text-[10px] font-medium tracking-wide text-primary shadow-sm backdrop-blur-sm dark:bg-primary/15">
                <span className="relative mr-1.5 flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {t('home.hero.badge')}
              </Badge>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.55 }}>
              <h1 className="max-w-[40rem] font-display text-[clamp(1.25rem,4.2vw,2.65rem)] font-light leading-[1.18] tracking-tight text-balance text-foreground">
                {t('home.hero.headline')}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]"
            >
              {t('home.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="mb-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground/90">
                {t('home.hero.statEyebrow')}
              </p>
              <div className="relative rounded-2xl bg-gradient-to-r from-primary/25 via-primary/[0.12] to-amber-500/20 p-px shadow-[0_12px_40px_-28px_hsl(var(--primary)/0.4)] dark:from-primary/30 dark:via-primary/15 dark:to-amber-400/15">
                <div className="grid min-w-0 grid-cols-1 gap-1.5 rounded-[calc(1rem-1px)] bg-background/55 p-1.5 backdrop-blur-xl dark:bg-[hsl(210_24%_10%/0.55)] md:grid-cols-3 md:gap-1.5 md:p-2">
                  <HeroStatItem
                    end={500}
                    suffix="M+"
                    label={t('home.hero.statLives')}
                    icon={Heart}
                    delay={0.18}
                    reduceMotion={reduceMotion}
                    compact
                  />
                  <HeroStatItem
                    end={180}
                    suffix="+"
                    label={t('home.hero.statCountries')}
                    icon={Globe2}
                    delay={0.24}
                    reduceMotion={reduceMotion}
                    compact
                  />
                  <HeroStatItem
                    end={40}
                    suffix="+"
                    label={t('home.hero.statYears')}
                    icon={History}
                    delay={0.3}
                    reduceMotion={reduceMotion}
                    compact
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Button
                size="lg"
                className="h-10 min-h-[40px] rounded-full bg-gradient-to-r from-primary to-amber-600/90 px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-105 dark:to-primary/90 sm:px-7"
                onClick={handleExplorePrograms}
              >
                {t('home.hero.explorePrograms')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 min-h-[40px] rounded-full border-2 border-foreground/15 bg-background/70 px-6 text-sm font-semibold backdrop-blur-md hover:bg-background dark:border-white/20 dark:bg-white/5 sm:px-7"
                onClick={handleWatchVideo}
              >
                <Play className="mr-2 h-4 w-4" />
                {t('home.hero.watchVideo')}
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 min-w-0 w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:col-span-5 xl:col-span-6"
          >
            {featuredCard}
          </motion.div>
        </div>
      </div>

      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        title={t('home.hero.videoModalTitle')}
        description={t('home.hero.videoModalDesc')}
      />
    </section>
  );
};
