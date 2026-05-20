/**
 * Searchable matrix of all 501 checklist capabilities + tier legend.
 */

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ALL_SEARCH_CAPABILITIES,
  summarizeTiers,
  type ImplementationTier,
} from '@/lib/search/searchCapabilityCatalog';
import { useTranslation } from '@/lib/i18n';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function tierBadgeClass(t: ImplementationTier): string {
  if (t === 'in_app') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100';
  if (t === 'partial_client') return 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100';
  return 'border-muted-foreground/30 bg-muted/50 text-muted-foreground';
}

function tierLabel(t: ImplementationTier, tfn: (k: string) => string): string {
  if (t === 'in_app') return tfn('search.capTierInApp');
  if (t === 'partial_client') return tfn('search.capTierPartial');
  return tfn('search.capTierInfra');
}

export function SearchCapabilityMatrix({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const summary = useMemo(() => summarizeTiers(), []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ALL_SEARCH_CAPABILITIES;
    return ALL_SEARCH_CAPABILITIES.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.bucket.toLowerCase().includes(s) ||
        String(c.id).includes(s),
    );
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[min(92vh,760px)] max-w-[calc(100vw-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="min-h-0 shrink-0 border-b border-border/50 px-4 pb-3 pt-4">
          <DialogTitle className="font-serif text-lg">{t('search.capMatrixTitle')}</DialogTitle>
          <p className="text-left text-xs leading-relaxed text-muted-foreground">
            {t('search.capMatrixBlurb')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[0.65rem] text-muted-foreground">
            <span>
              {t('search.capSummaryInApp')}: <strong className="text-foreground">{summary.in_app}</strong>
            </span>
            <span className="text-border">·</span>
            <span>
              {t('search.capSummaryPartial')}: <strong className="text-foreground">{summary.partial_client}</strong>
            </span>
            <span className="text-border">·</span>
            <span>
              {t('search.capSummaryInfra')}:{' '}
              <strong className="text-foreground">{summary.requires_infrastructure}</strong>
            </span>
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.capMatrixFilter')}
            className="mt-2 h-9"
          />
        </DialogHeader>
        <div className="min-h-0 max-h-[min(58vh,420px)] overflow-y-auto overflow-x-hidden px-4 pb-4 [-webkit-overflow-scrolling:touch] sm:max-h-[min(62vh,480px)]">
          <ul className="space-y-1 pr-1">
            {filtered.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/40 bg-muted/20 px-2 py-1.5 text-left text-xs"
              >
                <span className="tabular-nums text-muted-foreground">#{c.id}</span>
                <span className="min-w-0 flex-1 font-medium leading-snug text-foreground">{c.title}</span>
                <span className="shrink-0 text-[0.65rem] text-muted-foreground">{c.bucket}</span>
                <Badge variant="outline" className={cn('text-[0.6rem] font-normal', tierBadgeClass(c.tier))}>
                  {tierLabel(c.tier, t)}
                </Badge>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('search.capMatrixEmpty')}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
