/**
 * “Living index” — brand lockup + quick routes + three actionable pillars (not decorative cards).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AolicLogo } from '@/components/branding/AolicLogo';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';

const PILLAR_ROUTES: readonly { primary: string; secondary: string }[] = [
  { primary: ROUTES.PROGRAMS, secondary: ROUTES.PROGRAM_HAPPINESS },
  { primary: ROUTES.EXPLORE_MISSION, secondary: ROUTES.EXPLORE_VIDEOS },
  { primary: ROUTES.EVENTS_UPCOMING, secondary: ROUTES.SERVICES_STAY },
] as const;

const QUICK_ENTRIES: readonly { to: string; labelKey: 'home.showcase.quickPrograms' | 'home.showcase.quickEvents' | 'home.showcase.quickVisit' }[] = [
  { to: ROUTES.PROGRAMS, labelKey: 'home.showcase.quickPrograms' },
  { to: ROUTES.EVENTS_UPCOMING, labelKey: 'home.showcase.quickEvents' },
  { to: ROUTES.SERVICES_FACILITIES, labelKey: 'home.showcase.quickVisit' },
];

export function HomeShowcaseSection() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion() || useUserStore((s) => s.appearance.reduceMotion);

  return (
    <section
      className="relative overflow-hidden border-y border-primary/10 bg-[hsl(42_32%_96%)] py-16 dark:border-white/10 dark:bg-[hsl(222_24%_6%)] md:py-22"
      aria-labelledby="home-showcase-heading"
    >
      {/* Structural layers — not a flat “grey box” */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `linear-gradient(105deg, hsl(var(--primary) / 0.06) 0%, transparent 42%),
            radial-gradient(ellipse 90% 70% at 100% 0%, hsl(var(--secondary) / 0.07), transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent dark:via-primary/35"
        aria-hidden
      />

      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:gap-y-14">
          {/* Editorial column */}
          <div className="lg:col-span-7">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <span
                className="pointer-events-none select-none font-display text-[clamp(4rem,14vw,7rem)] font-light leading-none text-primary/[0.11] dark:text-primary/[0.14]"
                aria-hidden
              >
                “
              </span>
              <p className="-mt-10 mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-primary dark:text-primary/90">
                {t('home.showcase.eyebrow')}
              </p>
              <h2
                id="home-showcase-heading"
                className="max-w-2xl font-display text-[clamp(1.5rem,4vw,2.75rem)] font-light leading-[1.12] tracking-tight text-balance text-foreground dark:text-white"
              >
                {t('home.showcase.headline')}
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                {t('home.showcase.lead')}
              </p>
            </motion.div>
          </div>

          {/* Brand + ingress rail — logo useful for recognition & trust */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-[1.75rem] p-8 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.35)] md:p-10',
                'bg-[hsl(222_26%_9%)] text-white ring-1 ring-white/10',
                'dark:bg-[hsl(222_28%_7%)] dark:shadow-[0_32px_90px_-48px_rgba(0,0,0,0.65)]'
              )}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col items-center text-center">
                <AolicLogo
                  alt={t('home.showcase.logoAlt')}
                  className="h-12 w-auto object-contain md:h-14"
                  variant="onDark"
                />
                <p className="mt-5 font-display text-lg font-medium tracking-tight md:text-xl">{t('home.showcase.brandLockup')}</p>
                <p className="mt-1.5 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-white/55">
                  {t('home.showcase.brandLine')}
                </p>
              </div>

              <div className="relative mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 text-center text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-white/45">
                  {t('home.showcase.ingressLabel')}
                </p>
                <ul className="flex flex-col gap-1" role="list">
                  {QUICK_ENTRIES.map(({ to, labelKey }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.07] hover:text-white"
                      >
                        <span>{t(labelKey)}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary/90 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action pillars — numbered, utility line, dual CTAs */}
        <div className="mt-14 md:mt-20">
          <div className="grid gap-6 md:gap-0 lg:grid-cols-12">
            {([0, 1, 2] as const).map((i) => {
              const { primary, secondary } = PILLAR_ROUTES[i];
              const title = t(`home.showcase.pillars.${i}.title`);
              const body = t(`home.showcase.pillars.${i}.body`);
              const utility = t(`home.showcase.pillars.${i}.utility`);
              const cta = t(`home.showcase.pillars.${i}.cta`);
              const ctaSecondary = t(`home.showcase.pillars.${i}.ctaSecondary`);

              return (
                <motion.article
                  key={i}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={reduceMotion ? { duration: 0 } : { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'group relative flex flex-col border-border/50 dark:border-white/10 lg:col-span-4',
                    'border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8',
                    i === 0 && 'md:border-l-0 md:pl-0'
                  )}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[0.7rem] tabular-nums text-primary/70 dark:text-primary/80">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground dark:text-white md:text-xl">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <p className="mt-3 border-l-2 border-primary/35 pl-3 text-xs leading-snug text-foreground/85 dark:text-white/75">
                    {utility}
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      size="sm"
                      className="h-9 rounded-full bg-gradient-to-r from-primary to-amber-700/90 px-4 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/15 dark:to-primary/80"
                      asChild
                    >
                      <Link to={primary} className="inline-flex items-center gap-1.5">
                        {cta}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 rounded-full border-border/80 text-xs font-medium dark:border-white/15" asChild>
                      <Link to={secondary}>{ctaSecondary}</Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
