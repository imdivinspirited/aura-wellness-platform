/**
 * Future-proof mood-home blocks: spotlight, evidence, breath pacer, labs, safety, roadmap.
 * Content from moodAdvancedEn/Hi; toggles from moodHomeFeatures.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  HeartPulse,
  Mic,
  Radio,
  ShieldAlert,
  Sparkles,
  Telescope,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation, getCanonicalUiLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { moodAdvancedEn } from '@/lib/i18n/moodAdvancedEn';
import { moodAdvancedHi } from '@/lib/i18n/moodAdvancedHi';
import type { MoodKey } from '@/lib/moodWellnessContent';
import {
  isMoodHomeSectionEnabled,
  type MoodHomeSectionId,
} from '@/config/moodHomeFeatures';

const LAB_ICONS = [Mic, Activity, Cpu, Radio] as const;

type Props = {
  mood: MoodKey;
  reduceMotion: boolean;
  cardClassName?: string;
  accentClassName?: string;
};

function sectionEnabled(id: MoodHomeSectionId): boolean {
  return isMoodHomeSectionEnabled(id);
}

function CoherentBreathPacer({
  reduceMotion,
  breath,
}: {
  reduceMotion: boolean;
  breath: (typeof moodAdvancedEn)['breath'];
}) {
  const d = breath;

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-10">
      <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-primary/15',
            !reduceMotion && 'animate-coherent-breath'
          )}
          style={
            reduceMotion
              ? { transform: 'scale(1)', opacity: 0.85 }
              : undefined
          }
          aria-hidden
        />
        <div
          className={cn(
            'relative z-[1] flex h-32 w-32 items-center justify-center rounded-full border-2 border-primary/40 bg-background/90 text-center shadow-inner backdrop-blur-sm',
            !reduceMotion && 'animate-coherent-breath'
          )}
        >
          <span className="px-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {d.inhale} / {d.exhale}
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2 text-sm text-muted-foreground">
        <h4 className="font-display text-lg font-medium text-foreground">{d.title}</h4>
        <p>{d.subtitle}</p>
        <p className="text-xs italic opacity-90">{d.hint}</p>
      </div>
    </div>
  );
}

export function MoodHomeAdvancedSections({ mood, reduceMotion, cardClassName, accentClassName }: Props) {
  const { language } = useTranslation();
  const bundle = getCanonicalUiLanguage(language);
  const adv = bundle === 'hi' ? moodAdvancedHi : moodAdvancedEn;

  const showSafety = ['sad', 'depressed', 'stressed'].includes(mood);

  return (
    <div className="space-y-16 md:space-y-20">
      {sectionEnabled('spotlight') && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="space-y-6 px-1"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">
                {adv.spotlight.eyebrow}
              </p>
              <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{adv.spotlight.title}</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">{adv.spotlight.subtitle}</p>
            </div>
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-xs font-normal">
              CMS-ready
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {adv.spotlight.items.map((item, i) => (
              <Link key={item.href + i} to={item.href} className="group block h-full">
                <Card
                  className={cn(
                    'h-full border-border/60 bg-gradient-to-br from-card/95 to-muted/15 transition-all duration-300',
                    'hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg',
                    cardClassName
                  )}
                >
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit rounded-full text-[0.65rem] uppercase tracking-wide">
                      {item.badge}
                    </Badge>
                    <CardTitle className="font-display text-lg transition-colors group-hover:text-primary md:text-xl">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {sectionEnabled('evidenceBreath') && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="grid gap-8 px-1 lg:grid-cols-2 lg:gap-12"
        >
          <Card className={cn('border-border/60 bg-card/90', cardClassName)}>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Telescope className="h-5 w-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-widest">Evidence</span>
              </div>
              <CardTitle className="font-display text-2xl font-light">{adv.evidence.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">{adv.evidence.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{adv.evidence.body}</p>
            </CardContent>
          </Card>

          <Card className={cn('border-border/60 bg-gradient-to-b from-card to-primary/[0.03]', cardClassName)}>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <HeartPulse className="h-5 w-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-widest">Practice</span>
              </div>
            </CardHeader>
            <CardContent>
              <CoherentBreathPacer reduceMotion={reduceMotion} breath={adv.breath} />
            </CardContent>
          </Card>
        </motion.section>
      )}

      {showSafety && sectionEnabled('safety') && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-1"
        >
          <Card className="border-amber-500/35 bg-gradient-to-br from-amber-50/80 to-card dark:from-amber-950/25 dark:to-card">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              <div>
                <CardTitle className="font-display text-xl">{adv.safety.title}</CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed text-foreground/90">
                  {adv.safety.body}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="default" className="rounded-full">
                <Link to={adv.safety.href}>{adv.safety.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {sectionEnabled('labs') && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="space-y-8 px-1"
        >
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {adv.labs.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-light tracking-tight md:text-4xl">{adv.labs.title}</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">{adv.labs.subtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {adv.labs.cards.map((c, i) => {
              const Icon = LAB_ICONS[i % LAB_ICONS.length];
              return (
                <Card
                  key={c.title}
                  className={cn(
                    'border-border/60 bg-card/85 transition-shadow hover:shadow-md',
                    cardClassName
                  )}
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10',
                        accentClassName
                      )}
                    >
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="font-display text-lg">{c.title}</CardTitle>
                        <Badge variant="outline" className="text-[0.6rem] uppercase">
                          {c.status}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2 text-sm leading-relaxed">{c.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </motion.section>
      )}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        className="rounded-[1.75rem] border border-dashed border-primary/25 bg-muted/20 px-6 py-8 md:px-10 md:py-10"
      >
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {adv.futures.eyebrow}
        </p>
        <h3 className="font-display text-2xl font-light md:text-3xl">{adv.futures.title}</h3>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {adv.futures.bullets.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
