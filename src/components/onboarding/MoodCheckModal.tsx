import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useId, useState } from 'react';
import {
  Sun,
  Wind,
  CircleDot,
  CloudRain,
  CloudFog,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, type MoodType } from '@/stores/userStore';
import {
  OnboardingModalFrame,
  onboardingDialogContentClassName,
  onboardingDialogOverlayClassName,
} from '@/components/onboarding/OnboardingModalFrame';
import { useResolvedThemeMode } from '@/hooks/useResolvedThemeMode';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const moodOrder = ['happy', 'calm', 'neutral', 'sad', 'depressed', 'stressed'] as const;

const moods = [
  {
    type: 'happy' as MoodType,
    icon: Sun,
    accentBar: 'from-amber-300 via-orange-400 to-rose-400',
    glow: 'shadow-amber-500/25',
    iconBg: 'from-amber-400/25 to-orange-500/10',
    ringSel: 'ring-amber-400/40',
  },
  {
    type: 'calm' as MoodType,
    icon: Wind,
    accentBar: 'from-cyan-300 via-sky-400 to-indigo-400',
    glow: 'shadow-sky-500/20',
    iconBg: 'from-sky-400/25 to-cyan-500/10',
    ringSel: 'ring-sky-400/40',
  },
  {
    type: 'neutral' as MoodType,
    icon: CircleDot,
    accentBar: 'from-slate-300 via-zinc-400 to-stone-500',
    glow: 'shadow-slate-400/15',
    iconBg: 'from-slate-400/20 to-zinc-600/10',
    ringSel: 'ring-slate-300/35',
  },
  {
    type: 'sad' as MoodType,
    icon: CloudRain,
    accentBar: 'from-indigo-400 via-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
    iconBg: 'from-indigo-400/25 to-violet-600/10',
    ringSel: 'ring-violet-400/35',
  },
  {
    type: 'depressed' as MoodType,
    icon: CloudFog,
    accentBar: 'from-slate-500 via-slate-600 to-zinc-700',
    glow: 'shadow-slate-500/15',
    iconBg: 'from-slate-500/20 to-zinc-700/10',
    ringSel: 'ring-slate-400/30',
  },
  {
    type: 'stressed' as MoodType,
    icon: Zap,
    accentBar: 'from-rose-400 via-red-500 to-orange-600',
    glow: 'shadow-rose-500/25',
    iconBg: 'from-rose-400/25 to-red-600/10',
    ringSel: 'ring-rose-400/40',
  },
] as const;

export const MoodCheckModal = () => {
  const { t, _updateTrigger } = useTranslation();
  const { shouldShowMoodCheck, setMood, completeFirstMoodStep, appearance } = useUserStore();
  const resolvedMode = useResolvedThemeMode(appearance.theme);
  const isDark = resolvedMode === 'dark';
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [isOpen, setIsOpen] = useState(true);
  const reduceMotion = useReducedMotion();
  const groupId = useId();
  const showModal = shouldShowMoodCheck() && isOpen;

  const labelFor = (type: string) => t(`mood.modal.moods.${type}.label` as any);
  const hintFor = (type: string) => t(`mood.modal.moods.${type}.hint` as any);

  const handleConfirm = async () => {
    if (selectedMood) {
      setMood(selectedMood);
      completeFirstMoodStep();
      setIsOpen(false);
      try {
        const anonId =
          localStorage.getItem('anonymousId') ||
          localStorage.getItem('anonymous_id') ||
          `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('anonymousId', anonId);
        localStorage.setItem('anonymous_id', anonId);
        const { submitMoodEntry } = await import('@/lib/api/mood');
        await submitMoodEntry(selectedMood, anonId);
      } catch {
        /* mood remains in local store */
      }
    }
  };

  const handleSkip = () => {
    setMood('neutral');
    completeFirstMoodStep();
    setIsOpen(false);
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!showModal) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 6 && moodOrder[n - 1]) {
        setSelectedMood(moodOrder[n - 1]);
      }
    },
    [showModal],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  if (!showModal) return null;

  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 32 };

  return (
    <Dialog open={showModal} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent
        key={_updateTrigger}
        overlayClassName={onboardingDialogOverlayClassName(isDark)}
        className={onboardingDialogContentClassName(isDark)}
      >
        <OnboardingModalFrame isDark={isDark} reduceMotion={!!reduceMotion} bodyOverflow="hidden">
          {/* sr-only: full context for screen readers */}
          <span className="sr-only">{t('mood.modal.bodyNote')}</span>

          {/* Header — single compact row */}
          <div
            className={cn(
              'shrink-0 border-b px-1 pb-2 pt-3 sm:px-0 sm:pb-3 sm:pt-5',
              isDark ? 'border-white/[0.07]' : 'border-border'
            )}
          >
            <div className="flex items-start gap-2 sm:gap-4">
              <div
                className={cn(
                  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br sm:h-14 sm:w-14 sm:rounded-2xl',
                  isDark
                    ? 'border-white/15 from-white/10 to-white/[0.02] ring-1 ring-white/10'
                    : 'border-border from-primary/10 to-accent/5 ring-1 ring-border/60'
                )}
                aria-hidden
              >
                <Sparkles className={cn('h-4 w-4 sm:h-7 sm:w-7', isDark ? 'text-amber-200' : 'text-primary')} strokeWidth={1.35} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]', isDark ? 'text-amber-200/70' : 'text-primary/80')}>
                  {t('mood.modal.eyebrow')}
                </p>
                <DialogHeader className="space-y-0.5 p-0 text-left">
                  <DialogTitle
                    className={cn(
                      'font-display text-sm font-semibold leading-tight tracking-tight sm:text-xl sm:leading-snug',
                      isDark ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {t('mood.modal.title')}
                  </DialogTitle>
                  <DialogDescription
                    className={cn('text-[11px] leading-snug sm:text-sm', isDark ? 'text-slate-400' : 'text-muted-foreground')}
                  >
                    <span className={cn('font-medium', isDark ? 'text-slate-200/95' : 'text-foreground')}>{t('mood.modal.bodyLead')}</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-1 flex items-center gap-1">
                  <ShieldCheck className={cn('h-3 w-3 shrink-0', isDark ? 'text-emerald-400/90' : 'text-emerald-600')} aria-hidden />
                  <span className={cn('truncate text-[9px] sm:text-[10px]', isDark ? 'text-emerald-200/80' : 'text-emerald-800 dark:text-emerald-200/90')}>
                    {t('mood.modal.privacy')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend + 3×2 grid + actions — fills remaining height */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-2 pt-2 sm:px-0 sm:pb-3 sm:pt-3">
            <p
              id={`${groupId}-legend`}
              className={cn('mb-1.5 shrink-0 text-[8px] font-medium uppercase tracking-[0.15em] sm:mb-2 sm:text-[10px]', isDark ? 'text-slate-500' : 'text-muted-foreground')}
            >
              {t('mood.modal.legend')}
            </p>

            <div
              className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-1 sm:gap-2"
              role="radiogroup"
              aria-labelledby={`${groupId}-legend`}
            >
              {moods.map((mood, index) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.type;
                const mt = mood.type as string;
                const label = labelFor(mt);
                const hint = hintFor(mt);
                return (
                  <motion.button
                    key={mood.type}
                    type="button"
                    role="radio"
                    title={`${label} — ${hint}`}
                    aria-label={`${label}. ${hint}. ${t('mood.modal.pressKey').replace('{{n}}', String(index + 1))}`}
                    aria-checked={isSelected}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={reduceMotion ? undefined : { scale: 1.03, transition: { duration: 0.18 } }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: index * 0.03, ...spring }}
                    onClick={() => setSelectedMood(mood.type)}
                    className={cn(
                      'group relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border text-left transition-[box-shadow,background-color,border-color] duration-200 sm:rounded-xl',
                      'backdrop-blur-md',
                      isDark
                        ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
                        : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      isSelected
                        ? isDark
                          ? cn('border-white/25 bg-white/[0.1] shadow-md', mood.glow, mood.ringSel, 'ring-2 ring-offset-1 ring-offset-[#070b14]')
                          : cn('border-primary/40 bg-white/60 shadow-md', mood.glow, mood.ringSel, 'ring-2 ring-primary/30 ring-offset-1')
                        : isDark
                          ? 'border-white/[0.1] bg-white/[0.05] active:bg-white/[0.1] hover:bg-white/[0.08]'
                          : 'border-white/60 bg-white/40 active:bg-white/65 hover:bg-white/55'
                    )}
                  >
                    <div
                      className={cn(
                        'h-0.5 w-full shrink-0 bg-gradient-to-r transition-opacity duration-200',
                        mood.accentBar,
                        isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'absolute right-0.5 top-1 flex h-3.5 min-w-[0.85rem] items-center justify-center rounded px-0.5 font-mono text-[7px] font-semibold tabular-nums sm:right-1 sm:top-1.5 sm:h-4 sm:text-[9px]',
                        isDark ? 'bg-black/25 text-white/50' : 'bg-black/[0.06] text-foreground/45',
                        isSelected && (isDark ? 'text-amber-200/90' : 'text-primary')
                      )}
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pb-1 pt-0.5 sm:gap-1 sm:px-1.5 sm:pb-1.5 sm:pt-1">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-gradient-to-br transition-transform duration-200 sm:h-9 sm:w-9 sm:rounded-lg',
                          isDark ? 'border-white/10' : 'border-border',
                          mood.iconBg,
                          isSelected ? 'scale-105 opacity-100 shadow-sm' : 'opacity-85 group-hover:scale-105 group-hover:opacity-100'
                        )}
                        aria-hidden
                      >
                        <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isDark ? 'text-white/90' : 'text-foreground/90')} strokeWidth={1.65} />
                      </div>
                      <span
                        className={cn(
                          'w-full text-center text-[8px] font-semibold leading-[1.15] sm:text-[11px] sm:leading-tight',
                          isDark ? 'text-white' : 'text-foreground'
                        )}
                      >
                        {label}
                      </span>
                      <span
                        className={cn(
                          'line-clamp-3 w-full text-center text-[6.5px] font-medium leading-[1.25] sm:line-clamp-2 sm:text-[9px] sm:leading-snug',
                          isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-muted-foreground group-hover:text-foreground/80',
                          isSelected && (isDark ? '!text-slate-200' : '!text-foreground/85')
                        )}
                      >
                        {hint}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-1.5 min-h-[1.25rem] shrink-0 px-0.5 sm:mt-2 sm:min-h-[1.5rem]">
              {selectedMood ? (
                <p
                  className={cn(
                    'line-clamp-1 text-center text-[9px] leading-tight sm:text-[11px]',
                    isDark ? 'text-slate-300/95' : 'text-foreground/90'
                  )}
                  aria-live="polite"
                >
                  {t(`mood.modal.reassurance.${selectedMood}` as any)}
                </p>
              ) : (
                <span aria-hidden className="block h-[1.25rem] sm:h-[1.5rem]" />
              )}
            </div>

            <div className="mt-auto flex shrink-0 gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className={cn(
                  'h-9 flex-1 rounded-lg px-2 text-[11px] sm:h-10 sm:text-xs',
                  isDark ? 'text-slate-400 hover:bg-white/[0.06]' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {t('mood.modal.skip')}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedMood}
                className={cn(
                  'h-9 flex-[1.35] gap-1 rounded-lg border-0 px-2 text-[11px] font-semibold sm:h-10 sm:gap-2 sm:text-sm',
                  isDark
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 disabled:opacity-35'
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground disabled:opacity-35'
                )}
              >
                {t('mood.modal.apply')}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-95 sm:h-4 sm:w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </OnboardingModalFrame>
      </DialogContent>
    </Dialog>
  );
};
