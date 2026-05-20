import { cn } from '@/lib/utils';

/** Color-coded category badges (result type). */
export function categoryBadgeClass(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('course') || c.includes('program'))
    return 'border-violet-500/35 bg-violet-500/12 text-violet-800 dark:text-violet-200';
  if (c.includes('event')) return 'border-sky-500/35 bg-sky-500/12 text-sky-900 dark:text-sky-100';
  if (c.includes('page')) return 'border-emerald-500/35 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100';
  if (c.includes('service')) return 'border-amber-500/35 bg-amber-500/12 text-amber-950 dark:text-amber-100';
  if (c.includes('article') || c.includes('blog'))
    return 'border-rose-500/35 bg-rose-500/12 text-rose-900 dark:text-rose-100';
  if (c.includes('connect') || c.includes('career'))
    return 'border-cyan-500/35 bg-cyan-500/12 text-cyan-950 dark:text-cyan-100';
  return cn('border-border/50 bg-muted/60 text-muted-foreground');
}
