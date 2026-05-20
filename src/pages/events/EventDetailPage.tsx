import * as React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { getAllEventsSync } from '@/pages/events/services/eventService';
import { useEventsClock } from '@/pages/events/hooks/useEventsClock';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Globe, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import type { Event } from '@/pages/events/types';
import { YoutubeChannelLiveAside } from '@/pages/events/components/YoutubeChannelLiveCard';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';
import { DonationSection } from '@/pages/events/components/DonationSection';
import { getEventDonationConfig, updateEventDonationConfig, type DonationConfig } from '@/lib/api/events';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { SmartLink } from '@/components/ui/SmartLink';
import { formatEventDateRange, getEffectiveCategory } from '@/pages/events/utils/eventCategorization';
import { EventCountdown } from '@/pages/events/components/EventCountdown';
import { GurudevBirthdayEventSections } from '@/pages/events/components/GurudevBirthdayEventSections';
import { GurudevBirthdayHero } from '@/pages/events/components/GurudevBirthdayHero';
import { GurudevParticipateSheet } from '@/pages/events/components/GurudevParticipateSheet';
import { GurudevRegisterInterestSheet } from '@/pages/events/components/GurudevRegisterInterestSheet';
import { formatExpectedAttendeesHero, formatLocationLine } from '@/pages/events/utils/eventDetailFormatters';
import { useTranslation } from '@/lib/i18n';
import { useSeoPageMeta } from '@/components/seo/SeoOverrideContext';
import { DEFAULT_SITE_DESCRIPTION } from '@/components/seo/routeSeoMap';

function categoryLabel(c: ReturnType<typeof getEffectiveCategory>): string {
  if (c === 'upcoming') return 'Upcoming';
  if (c === 'ongoing') return 'Now live';
  return 'Archive';
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canEditDonation = user?.role === 'admin' || user?.role === 'root';
  const clock = useEventsClock(30_000);
  const [participateOpen, setParticipateOpen] = React.useState(false);
  const [registerInterestOpen, setRegisterInterestOpen] = React.useState(false);

  /**
   * Land at the hero. Prior route scroll is often preserved; we must reset to top.
   * Use `behavior: 'instant'` — global `html { scroll-behavior: smooth }` would otherwise
   * animate scrollTo(0), so users briefly see Overview then smoothly scroll up (bad UX).
   */
  React.useLayoutEffect(() => {
    const goTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    goTop();
    const id = requestAnimationFrame(goTop);
    return () => cancelAnimationFrame(id);
  }, [slug]);

  const event = React.useMemo(
    () => (slug ? getAllEventsSync().find((e) => e.slug === slug) : undefined),
    [slug, clock]
  );

  useSeoPageMeta(
    event
      ? {
          title: `${event.title} | Events | The AOLIC Bangalore`,
          description: (event.shortDescription || event.description || DEFAULT_SITE_DESCRIPTION).slice(0, 160),
        }
      : null
  );

  const [donation, setDonation] = React.useState<DonationConfig | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    getEventDonationConfig(slug)
      .then(setDonation)
      .catch(() => setDonation(null));
  }, [slug]);

  React.useEffect(() => {
    const openParticipate = searchParams.get('participate') === '1';
    const openInterest = searchParams.get('interest') === '1';
    if (!openParticipate && !openInterest) return;
    if (openParticipate) setParticipateOpen(true);
    if (openInterest) setRegisterInterestOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('participate');
    next.delete('interest');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSaveDonation = async (next: DonationConfig) => {
    if (!slug) return;
    setSaving(true);
    try {
      const saved = await updateEventDonationConfig(slug, next);
      setDonation(saved);
    } finally {
      setSaving(false);
    }
  };

  if (!event) {
    return (
      <MainLayout>
        <div className="container max-w-3xl py-24">
          <h1 className="font-display text-3xl font-light tracking-tight">Event not found</h1>
          <p className="mt-3 text-muted-foreground">This gathering is not in our calendar yet.</p>
          <Button className="mt-8 rounded-full" asChild>
            <Link to={ROUTES.EVENTS_UPCOMING}>Browse upcoming events</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const effective = getEffectiveCategory(event);

  return (
    <MainLayout>
      <article className="relative">
        {event.slug === 'gurudev-birthday-2026' ? (
          <GurudevBirthdayHero
            event={event}
            effective={effective}
            onOpenParticipate={() => setParticipateOpen(true)}
            onOpenRegisterInterest={() => setRegisterInterestOpen(true)}
          />
        ) : (
          <header className="relative min-h-[min(68vh,680px)] overflow-hidden">
            <div className="absolute inset-0">
              <SafeImage
                category="events"
                src={event.media.banner}
                alt={event.title}
                className="h-full w-full scale-105 object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-background dark:from-black/85 dark:via-[hsl(222_24%_6%/0.92)] dark:to-[hsl(222_24%_6%)]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay"
                style={{
                  backgroundImage: `linear-gradient(120deg, hsl(var(--primary) / 0.15) 0%, transparent 45%)`,
                }}
                aria-hidden
              />
            </div>

            <div className="relative container max-w-5xl px-4 pb-16 pt-10 md:pb-20 md:pt-14">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to={ROUTES.EVENTS_UPCOMING}
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to upcoming
                </Link>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={cn(
                      'border-white/20 bg-white/10 text-white backdrop-blur-md',
                      effective === 'ongoing' && 'border-primary/40 bg-primary/25'
                    )}
                  >
                    {categoryLabel(effective)}
                  </Badge>
                  {event.isAllDay && (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/60">
                      All day
                    </span>
                  )}
                </div>

                <h1 className="mt-5 max-w-4xl font-display text-[clamp(1.75rem,5vw,3.25rem)] font-light leading-[1.12] tracking-tight text-balance text-white">
                  {event.title}
                </h1>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
                  {event.shortDescription || event.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                    <span>{formatEventDateRange(event)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                    <span>{formatLocationLine(event)}</span>
                  </div>
                  {event.stats?.attendees != null && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                      <span>{formatExpectedAttendeesHero(event, event.stats.attendees)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-gradient-to-r from-primary to-amber-700/90 px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/25 dark:to-primary/85"
                    asChild
                  >
                    <SmartLink to={event.cta.link} openInNewTab={Boolean(event.cta.openInNewTab)}>
                      {event.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </SmartLink>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/35 bg-white/10 px-8 font-semibold text-white backdrop-blur-md hover:bg-white/15"
                    asChild
                  >
                    <SmartLink to={ROUTES.REGISTRATION} openInNewTab>
                      Register interest
                    </SmartLink>
                  </Button>
                </div>
              </motion.div>
            </div>
          </header>
        )}

        <div
          className={cn(
            'relative border-t border-border/60 bg-background',
            event.slug === 'gurudev-birthday-2026' && '-mt-8 md:-mt-10'
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            aria-hidden
          />
          <div
            className={cn(
              'container max-w-6xl px-4',
              event.slug === 'gurudev-birthday-2026' ? 'py-10 md:py-14' : 'py-14 md:py-20'
            )}
            data-aol-reading-root
          >
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="space-y-16 lg:col-span-7">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Overview
                  </div>
                  <div className="prose prose-lg prose-stone max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-light">
                    {event.description.split(/\n\n+/).map((para, i) => (
                      <p key={i} className={cn('lead text-muted-foreground', i > 0 && 'mt-6')}>
                        {para.trim()}
                      </p>
                    ))}
                  </div>
                </section>

                {event.slug === 'gurudev-birthday-2026' ? (
                  <GurudevBirthdayEventSections event={event} />
                ) : null}
              </div>

              <aside className="min-w-0 space-y-8 lg:col-span-5">
                <div className="min-w-0 space-y-8 lg:sticky lg:top-24">
                  {(effective === 'upcoming' || effective === 'ongoing') && (
                    <div className="rounded-[1.35rem] border border-border/70 bg-gradient-to-b from-card to-muted/15 p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.35)] dark:border-white/10 dark:from-[hsl(222_22%_10%)] dark:to-[hsl(222_26%_7%)]">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        {effective === 'upcoming' ? t('home.hero.countdownHeadingStart') : t('home.hero.countdownHeadingEnd')}
                      </p>
                      <div className="mt-4">
                        <EventCountdown
                          targetIso={effective === 'upcoming' ? event.startDate : event.endDate}
                          accessibilityLabel={
                            effective === 'upcoming'
                              ? t('home.hero.countdownAriaStart')
                              : t('home.hero.countdownAriaEnd')
                          }
                          size="md"
                        />
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        When this timer reaches zero, the page moves this gathering to the archive automatically—no manual
                        housekeeping.
                      </p>
                      {event.slug === 'gurudev-birthday-2026' ? (
                        <Button
                          type="button"
                          className="mt-6 w-full rounded-full font-semibold"
                          onClick={() => setParticipateOpen(true)}
                        >
                          {event.cta.label}
                        </Button>
                      ) : (
                        <Button className="mt-6 w-full rounded-full font-semibold" asChild>
                          <SmartLink to={event.cta.link} openInNewTab={Boolean(event.cta.openInNewTab)}>
                            {event.cta.label}
                          </SmartLink>
                        </Button>
                      )}
                    </div>
                  )}

                  {event.languages && event.languages.length > 0 && (
                    <div className="rounded-2xl border border-border/60 bg-muted/10 p-5 dark:border-white/10">
                      <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" aria-hidden />
                        Languages
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{event.languages.join(' · ')}</p>
                    </div>
                  )}

                  <YoutubeChannelLiveAside />
                </div>
              </aside>

              {event.highlights && event.highlights.length > 0 && (
                <section className="col-span-full border-t border-border/50 pt-12 lg:col-span-12 lg:pt-14">
                  <h2 className="font-display text-2xl font-light tracking-tight md:text-3xl">Highlights</h2>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {event.highlights.map((line, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-border/60 bg-muted/20 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <span className="mb-2 block font-mono text-[0.7rem] text-primary/80">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground/90">{line}</p>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              )}

              {((event.timeline && event.timeline.length > 0) || Boolean(event.liveStreamUrl)) && (
                <div className="space-y-16 lg:col-span-7">
                  {event.timeline && event.timeline.length > 0 && (
                    <section className="space-y-8">
                      <h2 className="font-display text-2xl font-light tracking-tight md:text-3xl">Schedule</h2>
                      <div className="relative border-l border-primary/25 pl-8">
                        {event.timeline.map((row, i) => (
                          <div key={i} className="relative pb-10 last:pb-0">
                            <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-primary/40 bg-background shadow-sm" />
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              {row.date} · {row.time} {row.timezone ? `(${row.timezone})` : ''}
                            </p>
                            <h3 className="mt-2 font-display text-lg font-medium">{row.title}</h3>
                            {row.description && (
                              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{row.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {event.liveStreamUrl && (
                    <section className="space-y-4">
                      <h2 className="font-display text-2xl font-light tracking-tight md:text-3xl">Live</h2>
                      <div className="overflow-hidden rounded-2xl border border-border/60 shadow-xl dark:border-white/10">
                        <YouTubeEmbed url={event.liveStreamUrl} title={`${event.title} live`} />
                      </div>
                    </section>
                  )}
                </div>
              )}

              <div className="col-span-full w-full min-w-0 border-t border-border/50 pt-12 lg:col-span-12 lg:pt-14">
                <DonationSection
                  config={donation}
                  canEdit={canEditDonation}
                  isSaving={saving}
                  onSave={canEditDonation ? handleSaveDonation : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
      {event.slug === 'gurudev-birthday-2026' ? (
        <>
          <GurudevParticipateSheet open={participateOpen} onOpenChange={setParticipateOpen} />
          <GurudevRegisterInterestSheet
            open={registerInterestOpen}
            onOpenChange={setRegisterInterestOpen}
            event={event}
          />
        </>
      ) : null}
    </MainLayout>
  );
}
