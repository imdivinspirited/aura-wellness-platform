import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Globe, Search, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, LANGUAGES } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';
import { useResolvedThemeMode } from '@/hooks/useResolvedThemeMode';
import {
  OnboardingModalFrame,
  onboardingDialogContentClassName,
  onboardingDialogOverlayClassName,
} from '@/components/onboarding/OnboardingModalFrame';

const FEATURED_ACCENTS = [
  { accentBar: 'from-amber-300 via-orange-400 to-rose-400', glow: 'shadow-amber-500/20', iconBg: 'from-amber-400/25 to-orange-500/10', ringSel: 'ring-amber-400/35' },
  { accentBar: 'from-cyan-300 via-sky-400 to-indigo-400', glow: 'shadow-sky-500/20', iconBg: 'from-sky-400/25 to-cyan-500/10', ringSel: 'ring-sky-400/35' },
  { accentBar: 'from-emerald-300 via-teal-400 to-cyan-500', glow: 'shadow-emerald-500/20', iconBg: 'from-emerald-400/25 to-teal-500/10', ringSel: 'ring-emerald-400/35' },
] as const;

/**
 * After first mood check: language selection. Uses the same shell as the mood modal.
 */
export const LanguageSelectionModal = () => {
  const { t, _updateTrigger } = useTranslation();
  const {
    hasCompletedFirstMoodStep,
    hasCompletedLanguageSetup,
    language,
    setLanguage,
    completeLanguageSetup,
    appearance,
  } = useUserStore();

  const resolvedMode = useResolvedThemeMode(appearance.theme);
  const isDark = resolvedMode === 'dark';
  const reduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(language);

  const open = hasCompletedFirstMoodStep && !hasCompletedLanguageSetup;

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return LANGUAGES;
    const query = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const featuredLanguages = useMemo(() => LANGUAGES.slice(0, 3), []);

  const handleConfirm = () => {
    setLanguage(selectedLang);
    completeLanguageSetup();
  };

  const selectedMeta = LANGUAGES.find((l) => l.code === selectedLang);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 3 && featuredLanguages[n - 1]) {
        setSelectedLang(featuredLanguages[n - 1].code);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, featuredLanguages]);

  return (
    <Dialog
      modal={false}
      open={open}
      onOpenChange={(next) => {
        if (!next && !useUserStore.getState().hasCompletedLanguageSetup) {
          setLanguage(selectedLang);
          completeLanguageSetup();
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
                <Globe className={cn('h-4 w-4 sm:h-7 sm:w-7', isDark ? 'text-amber-200' : 'text-primary')} strokeWidth={1.35} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]',
                    isDark ? 'text-amber-200/70' : 'text-primary/80'
                  )}
                >
                  {t('language.modal.eyebrow')}
                </p>
                <DialogHeader className="space-y-0.5 p-0 text-left">
                  <DialogTitle
                    className={cn(
                      'font-display text-sm font-semibold leading-tight tracking-tight sm:text-xl sm:leading-snug',
                      isDark ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {t('language.modal.title')}
                  </DialogTitle>
                  <DialogDescription
                    className={cn('text-[11px] leading-snug sm:text-sm', isDark ? 'text-slate-400' : 'text-muted-foreground')}
                  >
                    <span className={cn('font-medium', isDark ? 'text-slate-200/95' : 'text-foreground')}>
                      {t('language.modal.subtitle')}
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
                    {t('language.modal.privateNote' as any)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 pb-2 pt-2 sm:gap-3 sm:pb-3 sm:pt-3">
            <p
              className={cn(
                'shrink-0 text-[8px] font-medium uppercase tracking-[0.15em] sm:text-[10px]',
                isDark ? 'text-slate-500' : 'text-muted-foreground'
              )}
            >
              {t('language.modal.legend' as any)}
            </p>

            <div className="grid shrink-0 grid-cols-3 gap-1 sm:gap-2">
              {featuredLanguages.map((lang, index) => {
                const acc = FEATURED_ACCENTS[index];
                const isSelected = selectedLang === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    type="button"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    transition={reduceMotion ? { duration: 0 } : { delay: index * 0.04 }}
                    onClick={() => setSelectedLang(lang.code)}
                    className={cn(
                      'group relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border text-left backdrop-blur-md transition-all duration-200 sm:rounded-xl',
                      isDark
                        ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'
                        : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      isSelected
                        ? isDark
                          ? cn('border-white/25 bg-white/[0.1] shadow-md', acc.glow, acc.ringSel, 'ring-2 ring-offset-1 ring-offset-[#070b14]')
                          : cn('border-primary/40 bg-white/60 shadow-md', acc.glow, acc.ringSel, 'ring-2 ring-primary/30 ring-offset-1')
                        : isDark
                          ? 'border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08]'
                          : 'border-white/60 bg-white/40 hover:bg-white/55'
                    )}
                  >
                    <div
                      className={cn(
                        'h-0.5 w-full shrink-0 bg-gradient-to-r transition-opacity',
                        acc.accentBar,
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
                    <div className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 sm:gap-1 sm:px-1.5 sm:py-2.5">
                      <div
                        className={cn(
                          'flex min-h-[2rem] w-full items-center justify-center rounded-md border bg-gradient-to-br px-1 text-center sm:min-h-[2.25rem]',
                          isDark ? 'border-white/10' : 'border-border',
                          acc.iconBg
                        )}
                        aria-hidden
                      >
                        <span className="text-[11px] font-semibold leading-tight text-foreground sm:text-xs">{lang.nativeName}</span>
                      </div>
                      <span
                        className={cn(
                          'line-clamp-2 w-full text-center text-[6.5px] font-medium leading-tight sm:text-[9px]',
                          isDark ? 'text-slate-400' : 'text-muted-foreground'
                        )}
                      >
                        {lang.name}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder={t('language.modal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'h-9 pl-9 text-sm',
                  'border-white/70 bg-white/50 backdrop-blur-md placeholder:text-muted-foreground/80',
                  'focus-visible:ring-primary/30 dark:border-white/[0.1] dark:bg-white/[0.06]'
                )}
              />
            </div>

            <ScrollArea
              className={cn(
                'min-h-0 flex-1 rounded-xl border backdrop-blur-md',
                'border-white/60 bg-white/35 dark:border-white/[0.08] dark:bg-white/[0.03]'
              )}
            >
              <div className="space-y-0.5 p-2">
                {filteredLanguages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLang(lang.code)}
                    whileHover={reduceMotion ? undefined : { x: 2 }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors',
                      selectedLang === lang.code
                        ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/10 dark:bg-primary/20'
                        : 'hover:bg-white/60 dark:hover:bg-white/[0.06]'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">{lang.nativeName}</span>
                      <span className="truncate text-xs text-muted-foreground">({lang.name})</span>
                    </div>
                    {selectedLang === lang.code && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                  </motion.button>
                ))}

                {filteredLanguages.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t('language.modal.noResults')}</p>
                )}
              </div>
            </ScrollArea>

            <div className="mt-auto shrink-0 pt-1">
              <Button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  'h-10 w-full gap-2 rounded-lg border-0 text-sm font-semibold sm:h-11 sm:text-base',
                  isDark
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                )}
              >
                {t('language.modal.continueIn').replace('{{name}}', selectedMeta?.name ?? 'English')}
                <ArrowRight className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              </Button>
            </div>
          </div>
        </OnboardingModalFrame>
      </DialogContent>
    </Dialog>
  );
};
