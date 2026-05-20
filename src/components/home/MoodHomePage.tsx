/**
 * Mood-Based Dynamic Homepage — copy from i18n (`mood.home.*`).
 * Luxury editorial layout: ambient mesh, bento recommendations, sequenced journey.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { useUserStore, type MoodType } from '@/stores/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Heart,
  Smile,
  Cloud,
  Sun,
  Wind,
  Leaf,
  Music,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Play,
  Star,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { MoodWellnessMediaSection } from '@/components/home/MoodWellnessMediaSection';
import { MoodHomeAdvancedSections } from '@/components/home/MoodHomeAdvancedSections';

interface MoodContent {
  greeting: string;
  subtitle: string;
  bgClass: string;
  accentColor: string;
  recommendations: {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
    tag: string;
  }[];
  affirmation: string;
  ctaText: string;
  ctaLink: string;
}

/** Per-mood visual tokens: base wash, accents, ambient orb colours */
const moodVisual: Record<
  NonNullable<MoodType>,
  {
    mesh: string;
    accentColor: string;
    accentSoft: string;
    orbA: string;
    orbB: string;
    orbC: string;
    cardHover: string;
    quoteBorder: string;
  }
> = {
  happy: {
    mesh: 'from-emerald-950/[0.06] via-teal-50/90 to-amber-50/50 dark:from-emerald-950/50 dark:via-emerald-950/20 dark:to-stone-950/80',
    accentColor: 'text-emerald-800 dark:text-emerald-300',
    accentSoft: 'text-emerald-700/85 dark:text-emerald-400/90',
    orbA: 'bg-emerald-400/25 dark:bg-emerald-500/20',
    orbB: 'bg-amber-300/20 dark:bg-amber-400/15',
    orbC: 'bg-teal-300/15 dark:bg-teal-500/10',
    cardHover: 'hover:border-emerald-500/35 hover:shadow-emerald-500/10',
    quoteBorder: 'from-emerald-500/50 via-primary/40 to-amber-400/40',
  },
  calm: {
    mesh: 'from-sky-950/[0.07] via-slate-50/95 to-indigo-50/40 dark:from-slate-950/80 dark:via-blue-950/40 dark:to-slate-950',
    accentColor: 'text-sky-900 dark:text-sky-200',
    accentSoft: 'text-sky-800/90 dark:text-sky-300/85',
    orbA: 'bg-sky-400/22 dark:bg-sky-500/18',
    orbB: 'bg-indigo-300/18 dark:bg-indigo-500/12',
    orbC: 'bg-cyan-300/14 dark:bg-cyan-500/10',
    cardHover: 'hover:border-sky-500/35 hover:shadow-sky-500/10',
    quoteBorder: 'from-sky-500/45 via-primary/35 to-indigo-400/35',
  },
  neutral: {
    mesh: 'from-amber-950/[0.05] via-stone-50/95 to-neutral-100/60 dark:from-amber-950/30 dark:via-stone-950/60 dark:to-neutral-950',
    accentColor: 'text-amber-900 dark:text-amber-200',
    accentSoft: 'text-amber-800/88 dark:text-amber-300/85',
    orbA: 'bg-amber-400/20 dark:bg-amber-500/15',
    orbB: 'bg-stone-300/18 dark:bg-stone-500/12',
    orbC: 'bg-yellow-200/14 dark:bg-yellow-500/8',
    cardHover: 'hover:border-amber-500/35 hover:shadow-amber-500/10',
    quoteBorder: 'from-amber-500/45 via-primary/40 to-stone-400/35',
  },
  sad: {
    mesh: 'from-indigo-950/[0.08] via-violet-50/90 to-slate-50/70 dark:from-indigo-950/70 dark:via-violet-950/30 dark:to-slate-950',
    accentColor: 'text-indigo-900 dark:text-indigo-200',
    accentSoft: 'text-indigo-800/90 dark:text-indigo-300/85',
    orbA: 'bg-indigo-400/20 dark:bg-indigo-500/16',
    orbB: 'bg-violet-300/16 dark:bg-violet-500/12',
    orbC: 'bg-slate-300/12 dark:bg-slate-500/10',
    cardHover: 'hover:border-indigo-400/40 hover:shadow-indigo-500/10',
    quoteBorder: 'from-indigo-500/40 via-primary/35 to-violet-400/35',
  },
  depressed: {
    mesh: 'from-violet-950/[0.08] via-rose-50/85 to-stone-50/75 dark:from-violet-950/65 dark:via-rose-950/25 dark:to-stone-950',
    accentColor: 'text-violet-900 dark:text-violet-200',
    accentSoft: 'text-violet-800/90 dark:text-violet-300/85',
    orbA: 'bg-violet-400/18 dark:bg-violet-500/14',
    orbB: 'bg-rose-300/14 dark:bg-rose-500/10',
    orbC: 'bg-fuchsia-300/10 dark:bg-fuchsia-500/8',
    cardHover: 'hover:border-violet-400/38 hover:shadow-violet-500/10',
    quoteBorder: 'from-violet-500/40 via-primary/35 to-rose-400/32',
  },
  stressed: {
    mesh: 'from-teal-950/[0.07] via-cyan-50/92 to-emerald-50/55 dark:from-teal-950/70 dark:via-cyan-950/25 dark:to-stone-950',
    accentColor: 'text-teal-900 dark:text-teal-200',
    accentSoft: 'text-teal-800/90 dark:text-teal-300/85',
    orbA: 'bg-teal-400/22 dark:bg-teal-500/18',
    orbB: 'bg-cyan-300/18 dark:bg-cyan-500/12',
    orbC: 'bg-emerald-300/14 dark:bg-emerald-500/10',
    cardHover: 'hover:border-teal-500/38 hover:shadow-teal-500/10',
    quoteBorder: 'from-teal-500/42 via-primary/38 to-cyan-400/35',
  },
};

const moodStyle: Record<NonNullable<MoodType>, { bgClass: string; accentColor: string }> = {
  happy: {
    bgClass: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    accentColor: 'text-green-600 dark:text-green-400',
  },
  calm: {
    bgClass: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  neutral: {
    bgClass: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
  sad: {
    bgClass: 'from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
    accentColor: 'text-indigo-600 dark:text-indigo-400',
  },
  depressed: {
    bgClass: 'from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30',
    accentColor: 'text-violet-600 dark:text-violet-400',
  },
  stressed: {
    bgClass: 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30',
    accentColor: 'text-teal-600 dark:text-teal-400',
  },
};

const MOOD_ICONS: Record<NonNullable<MoodType>, [React.ElementType, React.ElementType, React.ElementType, React.ElementType]> = {
  happy: [Heart, Calendar, Sparkles, Users],
  calm: [Wind, Leaf, Cloud, Music],
  neutral: [BookOpen, Calendar, Star, Sun],
  sad: [Wind, Cloud, Heart, Music],
  depressed: [Sparkles, Heart, Leaf, Users],
  stressed: [Wind, Cloud, Leaf, Star],
};

const MOOD_LINKS: Record<NonNullable<MoodType>, [string, string, string, string]> = {
  happy: ['/seva-careers', '/events', '/programs', '/connect'],
  calm: ['/programs', '/explore', '/programs', '/events'],
  neutral: ['/programs', '/events', '/services', '/connect'],
  sad: ['/programs', '/programs', '/connect/support', '/events'],
  depressed: ['/programs', '/connect/support', '/programs', '/explore'],
  stressed: ['/programs', '/programs', '/explore', '/programs'],
};

function buildMoodContent(mood: NonNullable<MoodType>, t: (k: string) => string): MoodContent {
  const base = `mood.home.${mood}`;
  const icons = MOOD_ICONS[mood];
  const links = MOOD_LINKS[mood];
  const st = moodStyle[mood];

  const rec = ([1, 2, 3, 4] as const).map((i) => ({
    title: t(`${base}.rec${i}.title`),
    description: t(`${base}.rec${i}.description`),
    icon: icons[i - 1],
    link: links[i - 1],
    tag: t(`${base}.rec${i}.tag`),
  }));

  return {
    greeting: t(`${base}.greeting`),
    subtitle: t(`${base}.subtitle`),
    bgClass: st.bgClass,
    accentColor: st.accentColor,
    recommendations: rec,
    affirmation: t(`${base}.affirmation`),
    ctaText: t(`${base}.ctaText`),
    ctaLink:
      mood === 'happy'
        ? '/seva-careers'
        : mood === 'calm'
          ? '/programs'
          : mood === 'neutral'
            ? '/programs'
            : mood === 'sad'
              ? '/programs'
              : mood === 'depressed'
                ? '/connect/support'
                : '/programs',
  };
}

function getMoodContent(mood: MoodType, t: (k: string) => string): MoodContent {
  if (!mood) return buildMoodContent('neutral', t);
  return buildMoodContent(mood, t) || buildMoodContent('neutral', t);
}

const viewAnim = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function MoodHomePage() {
  const { t, _updateTrigger } = useTranslation();
  const { currentMood, appearance } = useUserStore();
  const systemReduce = useReducedMotion();
  const reduceMotion = systemReduce || appearance.reduceMotion;

  const moodKey = (currentMood ?? 'neutral') as NonNullable<MoodType>;
  const visual = moodVisual[moodKey];

  const content = useMemo(
    () => getMoodContent(currentMood, (k) => t(k as any)),
    [currentMood, t, _updateTrigger]
  );

  const moodLabel = t(`mood.modal.moods.${moodKey}.label` as any);

  const orbTransition = reduceMotion
    ? undefined
    : {
        duration: 14,
        repeat: Infinity,
        repeatType: 'mirror' as const,
        ease: 'easeInOut' as const,
      };

  return (
    <div className="space-y-14 pb-16 md:space-y-20 md:pb-24">
      {/* Hero */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br shadow-[0_32px_120px_-40px_hsl(var(--primary)/0.25)] dark:shadow-[0_32px_120px_-48px_hsl(260_30%_20%/0.5)]"
      >
        {/* Ambient orbs */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
          aria-hidden
        >
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-[0.97]', visual.mesh)} />
          <div
            className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.028)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent)' }}
          />
          {!reduceMotion && (
            <>
              <motion.div
                className={cn('absolute -left-24 top-0 h-[min(100%,520px)] w-[min(100%,520px)] rounded-full blur-3xl', visual.orbA)}
                animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
                transition={orbTransition}
              />
              <motion.div
                className={cn('absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full blur-3xl', visual.orbB)}
                animate={{ x: [0, -35, 0], y: [0, -25, 0], scale: [1, 1.12, 1] }}
                transition={{ ...orbTransition, duration: 18 }}
              />
              <motion.div
                className={cn('absolute left-1/3 top-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full blur-3xl', visual.orbC)}
                animate={{ opacity: [0.35, 0.55, 0.35] }}
                transition={{ ...orbTransition, duration: 10 }}
              />
            </>
          )}
        </div>

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/60 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground shadow-sm backdrop-blur-md dark:bg-background/40"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span>{t('mood.homeUi.heroBadge' as any)}</span>
              <span className="text-primary/80">·</span>
              <span className={cn('font-medium tracking-normal', visual.accentSoft)}>{moodLabel}</span>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.55 }}
              className={cn(
                'font-display text-[2.1rem] font-light leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.35rem]',
                visual.accentColor
              )}
            >
              {content.greeting}
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:max-w-2xl lg:text-lg"
            >
              {content.subtitle}
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                <Link to={content.ctaLink}>
                  {content.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 rounded-full border-primary/25 bg-background/70 px-8 text-base backdrop-blur-sm hover:bg-background"
              >
                <Link to="/programs" aria-label={t('mood.homeUi.secondaryCtaAria' as any)}>
                  {t('mood.homeUi.secondaryCta' as any)}
                </Link>
              </Button>
            </motion.div>

            <motion.ul
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/90 lg:justify-start"
            >
              <li className="flex items-center gap-2">
                <span className="h-px w-6 bg-primary/40" aria-hidden />
                {t('mood.homeUi.trustA' as any)}
              </li>
              <li className="hidden sm:block" aria-hidden>
                ◆
              </li>
              <li>{t('mood.homeUi.trustB' as any)}</li>
              <li className="hidden sm:block" aria-hidden>
                ◆
              </li>
              <li>{t('mood.homeUi.trustC' as any)}</li>
            </motion.ul>
          </div>
        </div>
      </motion.section>

      <MoodWellnessMediaSection mood={moodKey} cardClassName={visual.cardHover} />

      {/* Affirmation */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="relative px-1"
      >
        <motion.div
          variants={viewAnim}
          custom={0}
          className={cn(
            'relative overflow-hidden rounded-2xl border bg-card/40 p-8 shadow-xl backdrop-blur-md md:p-12',
            'before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b',
            visual.quoteBorder
          )}
        >
          <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {t('mood.homeUi.quoteLabel' as any)}
          </p>
          <div className="font-display text-[4.5rem] font-light leading-none text-primary/15 select-none md:text-[5.5rem]" aria-hidden>
            “
          </div>
          <blockquote className="-mt-4 max-w-3xl font-display text-xl font-light italic leading-relaxed text-foreground md:text-2xl">
            {content.affirmation}
          </blockquote>
        </motion.div>
      </motion.section>

      <MoodHomeAdvancedSections
        mood={moodKey}
        reduceMotion={reduceMotion}
        cardClassName={visual.cardHover}
        accentClassName={visual.accentColor}
      />

      {/* Journey */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        className="px-1"
      >
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{t('mood.homeUi.journeyTitle' as any)}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{t('mood.homeUi.journeySubtitle' as any)}</p>
        </div>
        <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
          {[
            { title: t('mood.homeUi.journey1Title' as any), body: t('mood.homeUi.journey1Body' as any), n: '01' },
            { title: t('mood.homeUi.journey2Title' as any), body: t('mood.homeUi.journey2Body' as any), n: '02' },
            { title: t('mood.homeUi.journey3Title' as any), body: t('mood.homeUi.journey3Body' as any), n: '03' },
          ].map((step, i) => (
            <motion.li
              key={step.n}
              variants={viewAnim}
              custom={i}
              className="group relative rounded-2xl border border-border/70 bg-gradient-to-br from-card/80 to-card/30 p-6 shadow-sm transition-shadow hover:shadow-md md:p-8"
            >
              <span
                className={cn(
                  'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 font-display text-lg font-medium text-primary',
                  visual.accentColor
                )}
              >
                {step.n}
              </span>
              <h3 className="font-display text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{step.body}</p>
              {i < 2 && (
                <div
                  className="absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-border to-transparent md:block lg:w-12"
                  aria-hidden
                />
              )}
            </motion.li>
          ))}
        </ol>
      </motion.section>

      {/* Recommendations bento */}
      <section className="px-1">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{t('mood.homeUi.recommendedTitle' as any)}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{t('mood.homeUi.recommendedSubtitle' as any)}</p>
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-6">
          {content.recommendations.map((rec, i) => {
            const Icon = rec.icon;
            const featured = i === 0;
            return (
              <motion.div
                key={`${rec.title}-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  featured && 'md:col-span-3 md:row-span-2 md:min-h-[340px]',
                  !featured && i === 1 && 'md:col-span-3',
                  !featured && i === 2 && 'md:col-span-3',
                  !featured && i === 3 && 'md:col-span-6'
                )}
              >
                <Link to={rec.link} className="group block h-full">
                  <Card
                    className={cn(
                      'relative h-full overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300',
                      'hover:-translate-y-0.5 hover:shadow-xl',
                      visual.cardHover,
                      featured && 'border-primary/20 shadow-lg shadow-primary/5'
                    )}
                  >
                    {featured && (
                      <div
                        className={cn(
                          'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-40',
                          visual.orbA
                        )}
                        aria-hidden
                      />
                    )}
                    <CardHeader className={cn('relative pb-2', featured && 'md:p-8 md:pb-4')}>
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 to-transparent shadow-inner',
                            content.accentColor
                          )}
                        >
                          <Icon className={cn('h-6 w-6', featured && 'md:h-7 md:w-7')} />
                        </div>
                        <Badge variant="secondary" className="shrink-0 rounded-full border border-border/50 bg-background/80 text-[0.65rem] uppercase tracking-wider">
                          {rec.tag}
                        </Badge>
                      </div>
                      <CardTitle
                        className={cn(
                          'mt-4 font-display text-lg tracking-tight transition-colors group-hover:text-primary md:text-xl',
                          featured && 'md:mt-6 md:text-2xl lg:text-3xl'
                        )}
                      >
                        {rec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn('relative pt-0', featured && 'md:px-8 md:pb-8')}>
                      <p className={cn('text-sm leading-relaxed text-muted-foreground', featured && 'md:text-base lg:max-w-md')}>
                        {rec.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">
                        {t('common.continue')}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        className="px-1"
        aria-labelledby="mood-quick-actions-heading"
      >
        <div className="mb-6 max-w-2xl sm:mb-8">
          <h2
            id="mood-quick-actions-heading"
            className="font-display text-2xl font-light tracking-tight text-balance sm:text-3xl md:text-4xl"
          >
            {t('mood.homeUi.quickActionsTitle' as any)}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty sm:text-base">
            {t('mood.homeUi.quickActionsSubtitle' as any)}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {[
            {
              icon: Play,
              title: t('mood.homeUi.quickMeditation.title' as any),
              desc: t('mood.homeUi.quickMeditation.desc' as any),
              cta: t('mood.homeUi.quickMeditation.cta' as any),
              to: '/programs',
            },
            {
              icon: BookOpen,
              title: t('mood.homeUi.dailyWisdom.title' as any),
              desc: t('mood.homeUi.dailyWisdom.desc' as any),
              cta: t('mood.homeUi.dailyWisdom.cta' as any),
              to: '/explore',
            },
            {
              icon: Smile,
              title: t('mood.homeUi.shareStory.title' as any),
              desc: t('mood.homeUi.shareStory.desc' as any),
              cta: t('mood.homeUi.shareStory.cta' as any),
              to: '/connect',
            },
          ].map((item, i) => (
            <motion.div
              key={item.to}
              variants={viewAnim}
              custom={i}
              className={cn(
                'min-w-0',
                i === 2 && 'sm:col-span-2 sm:mx-auto sm:max-w-lg lg:col-span-1 lg:mx-0 lg:max-w-none'
              )}
            >
              <Card
                className={cn(
                  'group flex h-full min-h-0 flex-col overflow-hidden border-border/60 bg-gradient-to-b from-card via-card/95 to-muted/15',
                  'shadow-sm ring-1 ring-border/40 transition-all duration-300',
                  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:ring-primary/15',
                  visual.cardHover
                )}
              >
                <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-7">
                  <div className="mb-4 flex justify-center sm:mb-5">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/18 to-primary/5 text-primary shadow-inner',
                        'transition-transform duration-300 group-hover:scale-[1.03] sm:h-16 sm:w-16'
                      )}
                      aria-hidden
                    >
                      <item.icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
                    </div>
                  </div>
                  <h3 className="text-center font-display text-base font-semibold leading-snug tracking-tight text-balance text-foreground sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-center text-sm leading-relaxed text-muted-foreground text-pretty sm:text-[0.9375rem]">
                    {item.desc}
                  </p>
                  <div className="mt-5 w-full border-t border-border/50 pt-5 sm:mt-6">
                    <Button
                      variant="outline"
                      size="default"
                      asChild
                      className={cn(
                        'h-11 w-full min-h-[2.75rem] justify-center gap-2 rounded-xl border-primary/35 bg-background/80 px-4 text-sm font-semibold shadow-sm',
                        'transition-colors hover:border-primary/50 hover:bg-primary/5',
                        'focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-12 sm:text-base'
                      )}
                    >
                      <Link to={item.to} className="inline-flex w-full items-center justify-center gap-2">
                        <span className="truncate">{item.cta}</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
