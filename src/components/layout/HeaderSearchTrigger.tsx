import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type HeaderSearchTriggerProps = {
  onOpen: () => void;
  className?: string;
};

/**
 * Command-palette style trigger — opens site search (modal). No raw input in header.
 */
export function HeaderSearchTrigger({ onOpen, className }: HeaderSearchTriggerProps) {
  const { t } = useTranslation();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={t('search.ariaOpen')}
      className={cn(
        'group relative flex w-full min-w-0 max-w-xl items-center gap-2 rounded-xl border border-border/50',
        'bg-gradient-to-br from-background/90 via-muted/40 to-muted/20',
        'shadow-[inset_0_1px_0_hsla(0,0%,100%,0.08),0_1px_2px_hsla(0,0%,0%,0.04)]',
        'min-h-[2.5rem] px-2.5 py-1.5 text-left sm:gap-3 sm:px-3 sm:py-2',
        'transition-[box-shadow,border-color,transform] duration-300 ease-out',
        'hover:border-primary/30 hover:shadow-[0_10px_40px_-14px_hsla(0,0%,0%,0.2),0_0_0_1px_hsl(var(--primary)/0.12)]',
        'dark:from-background/55 dark:via-muted/25 dark:to-muted/10',
        'dark:hover:shadow-[0_14px_44px_-12px_rgba(0,0,0,0.55),0_0_0_1px_hsl(var(--primary)/0.15)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      whileHover={{ scale: 1.008 }}
      whileTap={{ scale: 0.994 }}
      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
    >
      <Search
        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        strokeWidth={2}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-left text-[0.75rem] font-medium leading-snug tracking-tight text-foreground/80 sm:text-[0.8125rem]">
        {t('search.triggerLabel')}
      </span>
      <kbd
        className={cn(
          'pointer-events-none hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-border/55',
          'bg-gradient-to-b from-muted/70 to-muted/35 px-2 py-0.5 font-mono text-[0.58rem] font-medium leading-none',
          'text-muted-foreground shadow-[inset_0_1px_0_hsla(0,0%,100%,0.08)] sm:inline-flex',
        )}
      >
        <span className="text-[0.52rem] opacity-85">⌘</span>K
      </kbd>
    </motion.button>
  );
}
