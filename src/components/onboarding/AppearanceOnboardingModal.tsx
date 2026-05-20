import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Moon,
  Monitor,
  Palette,
  Sun,
  Sparkles,
  Waves,
  Trees,
  Eye,
  Contrast,
  MoveHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, type ThemePreset, type ThemeType } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import { useResolvedThemeMode } from '@/hooks/useResolvedThemeMode';
import {
  OnboardingModalFrame,
  onboardingDialogContentClassName,
  onboardingDialogOverlayClassName,
} from '@/components/onboarding/OnboardingModalFrame';

const PRESETS: { id: ThemePreset; icon: typeof Sparkles; accentBar: string; glow: string; iconBg: string; ringSel: string }[] = [
  {
    id: 'classic-spiritual',
    icon: Sparkles,
    accentBar: 'from-amber-300 via-orange-400 to-rose-400',
    glow: 'shadow-amber-500/20',
    iconBg: 'from-amber-400/25 to-orange-500/10',
    ringSel: 'ring-amber-400/35',
  },
  {
    id: 'ocean-calm',
    icon: Waves,
    accentBar: 'from-cyan-300 via-sky-400 to-indigo-400',
    glow: 'shadow-sky-500/20',
    iconBg: 'from-sky-400/25 to-cyan-500/10',
    ringSel: 'ring-sky-400/35',
  },
  {
    id: 'forest-serenity',
    icon: Trees,
    accentBar: 'from-emerald-400 via-green-500 to-teal-600',
    glow: 'shadow-emerald-500/20',
    iconBg: 'from-emerald-400/25 to-teal-500/10',
    ringSel: 'ring-emerald-400/35',
  },
];

const MODE_STYLES: Record<
  ThemeType,
  { accentBar: string; glow: string; iconBg: string; ringSel: string }
> = {
  light: {
    accentBar: 'from-amber-200 via-yellow-300 to-orange-300',
    glow: 'shadow-amber-500/20',
    iconBg: 'from-amber-400/25 to-yellow-500/10',
    ringSel: 'ring-amber-400/35',
  },
  dark: {
    accentBar: 'from-indigo-400 via-violet-500 to-slate-700',
    glow: 'shadow-violet-500/20',
    iconBg: 'from-indigo-400/25 to-violet-600/10',
    ringSel: 'ring-violet-400/35',
  },
  system: {
    accentBar: 'from-slate-300 via-zinc-400 to-slate-500',
    glow: 'shadow-slate-400/15',
    iconBg: 'from-slate-400/20 to-zinc-600/10',
    ringSel: 'ring-slate-300/35',
  },
};

/**
 * After language: theme, palette, and comfort — same shell as mood & language modals.
 */
export const AppearanceOnboardingModal = () => {
  const { t, _updateTrigger } = useTranslation();
  const {
    hasCompletedLanguageSetup,
    hasCompletedAppearanceOnboarding,
    appearance,
    setTheme,
    setThemePreset,
    setCalmMode,
    setHighContrast,
    setReduceMotion,
    setFontSize,
    completeAppearanceOnboarding,
  } = useUserStore();

  const resolvedMode = useResolvedThemeMode(appearance.theme);
  const isDark = resolvedMode === 'dark';
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<ThemeType>(appearance.theme);
  const [preset, setPreset] = useState<ThemePreset>(appearance.themePreset);
  const [calm, setCalm] = useState(appearance.calmMode);
  const [hiContrast, setHiContrast] = useState(appearance.highContrast);
  const [redMotion, setRedMotion] = useState(appearance.reduceMotion);
  const [fontSize, setFontSz] = useState(appearance.fontSize);

  const open = hasCompletedLanguageSetup && !hasCompletedAppearanceOnboarding;

  const modeOptions: { value: ThemeType; icon: typeof Sun; labelKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'appearance.onboarding.modeLight' },
    { value: 'dark', icon: Moon, labelKey: 'appearance.onboarding.modeDark' },
    { value: 'system', icon: Monitor, labelKey: 'appearance.onboarding.modeSystem' },
  ];

  const presetLabel = (id: ThemePreset) => {
    if (id === 'classic-spiritual') return t('appearance.onboarding.presetClassic' as any);
    if (id === 'ocean-calm') return t('appearance.onboarding.presetOcean' as any);
    return t('appearance.onboarding.presetForest' as any);
  };

  const fontSizes = (['S', 'M', 'L', 'XL'] as const).map((s) => ({
    value: s,
    label:
      s === 'S'
        ? t('appearance.onboarding.fontS' as any)
        : s === 'M'
          ? t('appearance.onboarding.fontM' as any)
          : s === 'L'
            ? t('appearance.onboarding.fontL' as any)
            : t('appearance.onboarding.fontXL' as any),
  }));

  const applyAndContinue = () => {
    setTheme(mode);
    setThemePreset(preset);
    setCalmMode(calm);
    setHighContrast(hiContrast);
    setReduceMotion(redMotion);
    setFontSize(fontSize);
    completeAppearanceOnboarding();
  };

  return (
    <Dialog
      modal={false}
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          const st = useUserStore.getState();
          if (st.hasCompletedLanguageSetup && !st.hasCompletedAppearanceOnboarding) {
            applyAndContinue();
          }
        }
      }}
    >
      <DialogContent
        key={_updateTrigger}
        overlayClassName={onboardingDialogOverlayClassName(isDark)}
        className={onboardingDialogContentClassName(isDark)}
      >
        <OnboardingModalFrame isDark={isDark} reduceMotion={!!reduceMotion} bodyOverflow="auto">
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
                <Palette className={cn('h-4 w-4 sm:h-7 sm:w-7', isDark ? 'text-amber-200' : 'text-primary')} strokeWidth={1.35} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]',
                    isDark ? 'text-amber-200/70' : 'text-primary/80'
                  )}
                >
                  {t('appearance.onboarding.eyebrow' as any)}
                </p>
                <DialogHeader className="space-y-0.5 p-0 text-left">
                  <DialogTitle
                    className={cn(
                      'font-display text-sm font-semibold leading-tight tracking-tight sm:text-xl sm:leading-snug',
                      isDark ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {t('appearance.onboarding.title' as any)}
                  </DialogTitle>
                  <DialogDescription
                    className={cn('text-[11px] leading-snug sm:text-sm', isDark ? 'text-slate-400' : 'text-muted-foreground')}
                  >
                    <span className={cn('font-medium', isDark ? 'text-slate-200/95' : 'text-foreground')}>
                      {t('appearance.onboarding.subtitle' as any)}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-1 flex items-center gap-1">
                  <ShieldCheck className={cn('h-3 w-3 shrink-0', isDark ? 'text-emerald-400/90' : 'text-emerald-600')} aria-hidden />
                  <span
                    className={cn(
                      'truncate text-[9px] sm:text-[10px]',
                      isDark ? 'text-emerald-200/80' : 'text-emerald-800 dark:text-emerald-200/90'
                    )}
                  >
                    {t('appearance.onboarding.privateNote' as any)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 pb-2 pt-2 sm:gap-5 sm:pb-4 sm:pt-3">
            <div>
              <p
                className={cn(
                  'mb-1.5 text-[8px] font-medium uppercase tracking-[0.15em] sm:mb-2 sm:text-[10px]',
                  isDark ? 'text-slate-500' : 'text-muted-foreground'
                )}
              >
                {t('appearance.onboarding.modeLabel' as any)}
              </p>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {modeOptions.map(({ value, icon: Icon, labelKey }, index) => {
                  const st = MODE_STYLES[value];
                  const isSelected = mode === value;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      transition={reduceMotion ? { duration: 0 } : { delay: index * 0.04 }}
                      onClick={() => setMode(value)}
                      className={cn(
                        'group relative flex min-h-0 flex-col overflow-hidden rounded-lg border text-center backdrop-blur-md transition-all duration-200 sm:rounded-xl',
                        isDark
                          ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
                          : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        isSelected
                          ? isDark
                            ? cn('border-white/25 bg-white/[0.1] shadow-md', st.glow, st.ringSel, 'ring-2 ring-offset-1 ring-offset-[#070b14]')
                            : cn('border-primary/40 bg-white/60 shadow-md', st.glow, st.ringSel, 'ring-2 ring-primary/30 ring-offset-1')
                          : isDark
                            ? 'border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08]'
                            : 'border-white/60 bg-white/40 hover:bg-white/55'
                      )}
                    >
                      <div
                        className={cn(
                          'h-0.5 w-full shrink-0 bg-gradient-to-r transition-opacity',
                          st.accentBar,
                          isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                        )}
                        aria-hidden
                      />
                      <div className="flex flex-col items-center gap-1 px-1 py-2 sm:py-2.5">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md border bg-gradient-to-br sm:h-9 sm:w-9 sm:rounded-lg',
                            isDark ? 'border-white/10' : 'border-border',
                            st.iconBg
                          )}
                          aria-hidden
                        >
                          <Icon className="h-4 w-4 text-foreground/90 sm:h-[18px] sm:w-[18px]" />
                        </div>
                        <span className="text-[9px] font-semibold leading-tight sm:text-[11px]">{t(labelKey as any)}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <p
                className={cn(
                  'mb-1.5 text-[8px] font-medium uppercase tracking-[0.15em] sm:mb-2 sm:text-[10px]',
                  isDark ? 'text-slate-500' : 'text-muted-foreground'
                )}
              >
                {t('appearance.onboarding.presetLabel' as any)}
              </p>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {PRESETS.map(({ id, icon: Icon, accentBar, glow, iconBg, ringSel }, index) => {
                  const isSelected = preset === id;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      transition={reduceMotion ? { duration: 0 } : { delay: 0.08 + index * 0.04 }}
                      onClick={() => setPreset(id)}
                      className={cn(
                        'group relative flex min-h-0 flex-col overflow-hidden rounded-lg border text-center backdrop-blur-md transition-all duration-200 sm:rounded-xl',
                        isDark
                          ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
                          : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        isSelected
                          ? isDark
                            ? cn('border-white/25 bg-white/[0.1] shadow-md', glow, ringSel, 'ring-2 ring-offset-1 ring-offset-[#070b14]')
                            : cn('border-primary/40 bg-white/60 shadow-md', glow, ringSel, 'ring-2 ring-primary/30 ring-offset-1')
                          : isDark
                            ? 'border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08]'
                            : 'border-white/60 bg-white/40 hover:bg-white/55'
                      )}
                    >
                      <div
                        className={cn(
                          'h-0.5 w-full shrink-0 bg-gradient-to-r transition-opacity',
                          accentBar,
                          isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                        )}
                        aria-hidden
                      />
                      <div className="flex flex-col items-center gap-1 px-0.5 py-2 sm:py-2.5">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-md border bg-gradient-to-br sm:h-9 sm:w-9 sm:rounded-lg',
                            isDark ? 'border-white/10' : 'border-border',
                            iconBg
                          )}
                          aria-hidden
                        >
                          <Icon className="h-4 w-4 text-foreground/90 sm:h-[18px] sm:w-[18px]" />
                        </div>
                        <span className="line-clamp-2 text-[8px] font-semibold leading-tight sm:text-[10px]">{presetLabel(id)}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                'space-y-3 rounded-xl border p-3 backdrop-blur-md',
                isDark ? 'border-white/[0.1] bg-white/[0.05]' : 'border-white/60 bg-white/35'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <Label className="text-sm font-medium">{t('appearance.onboarding.eyeComfortLabel' as any)}</Label>
                  </div>
                  <p className="mt-0.5 pl-6 text-[11px] text-muted-foreground">{t('appearance.onboarding.eyeComfortHint' as any)}</p>
                </div>
                <Switch checked={calm} onCheckedChange={setCalm} />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3 dark:border-white/[0.06]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <Label className="text-sm font-medium">{t('appearance.onboarding.highContrastLabel' as any)}</Label>
                  </div>
                  <p className="mt-0.5 pl-6 text-[11px] text-muted-foreground">{t('appearance.onboarding.highContrastHint' as any)}</p>
                </div>
                <Switch checked={hiContrast} onCheckedChange={setHiContrast} />
              </div>
            </div>

            <div>
              <p
                className={cn(
                  'mb-2 flex items-center gap-2 text-[8px] font-medium uppercase tracking-[0.15em] sm:text-[10px]',
                  isDark ? 'text-slate-500' : 'text-muted-foreground'
                )}
              >
                <MoveHorizontal className="h-3.5 w-3.5" aria-hidden />
                {t('appearance.onboarding.moreLabel' as any)}
              </p>
              <div
                className={cn(
                  'space-y-3 rounded-xl border p-3 backdrop-blur-md',
                  isDark ? 'border-white/[0.1] bg-white/[0.05]' : 'border-white/60 bg-white/30'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label className="text-sm">{t('appearance.onboarding.reduceMotionLabel' as any)}</Label>
                    <p className="text-[11px] text-muted-foreground">{t('appearance.onboarding.reduceMotionHint' as any)}</p>
                  </div>
                  <Switch checked={redMotion} onCheckedChange={setRedMotion} />
                </div>
                <div>
                  <Label className="mb-2 block text-xs font-medium">{t('appearance.onboarding.fontSizeLabel' as any)}</Label>
                  <div className="flex flex-wrap gap-2">
                    {fontSizes.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFontSz(value)}
                        className={cn(
                          'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                          fontSize === value
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-background/60 hover:bg-muted'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto shrink-0 pt-1">
              <Button
                type="button"
                onClick={applyAndContinue}
                className={cn(
                  'h-10 w-full gap-2 rounded-lg border-0 text-sm font-semibold sm:h-11 sm:text-base',
                  isDark
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                )}
              >
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                {t('appearance.onboarding.continue' as any)}
                <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </Button>
            </div>
          </div>
        </OnboardingModalFrame>
      </DialogContent>
    </Dialog>
  );
};
