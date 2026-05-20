/**
 * Full profile strength breakdown — weighted fields, strong vs gaps, edit CTA.
 */
import { memo, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  getProfileCompletenessBreakdown,
  type ProfileCompletenessInput,
} from '@/lib/profileOverviewUtils';

const CHART_COLORS = {
  good: '#10b981',
  warn: '#f59e0b',
  bad: '#f43f5e',
  muted: '#94a3b8',
  primary: '#6366f1',
};

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="font-medium text-foreground">{p.name}</div>
      <div className="mt-0.5 tabular-nums text-muted-foreground">{p.value}</div>
    </div>
  );
}

export type ProfileStrengthAnalysisDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: ProfileCompletenessInput;
  onEditProfile: () => void;
};

export const ProfileStrengthAnalysisDialog = memo(function ProfileStrengthAnalysisDialog({
  open,
  onOpenChange,
  input,
  onEditProfile,
}: ProfileStrengthAnalysisDialogProps) {
  const breakdown = useMemo(() => getProfileCompletenessBreakdown(input), [input]);

  const donutData = useMemo(() => {
    const filled = breakdown.strong.length;
    const missing = breakdown.gaps.length;
    return [
      { name: 'Filled', value: filled, color: CHART_COLORS.good },
      { name: 'Missing', value: missing, color: CHART_COLORS.warn },
    ];
  }, [breakdown.gaps.length, breakdown.strong.length]);

  const topUpgrades = useMemo(() => {
    return breakdown.gaps.slice(0, 6).map((f) => ({
      name: f.label,
      value: f.pointsIfFilled,
    }));
  }, [breakdown.gaps]);

  const earnedStack = useMemo(() => {
    const earned = breakdown.strong.reduce((s, f) => s + f.pointsIfFilled, 0);
    const remaining = Math.max(0, 100 - earned);
    return [{ name: 'Score', earned: Math.round(earned * 10) / 10, remaining: Math.round(remaining * 10) / 10 }];
  }, [breakdown.strong]);

  const groupWave = useMemo(() => {
    const byGroup = new Map<string, { total: number; earned: number }>();
    for (const f of breakdown.fields) {
      const cur = byGroup.get(f.group) ?? { total: 0, earned: 0 };
      cur.total += f.pointsIfFilled;
      if (f.filled) cur.earned += f.pointsIfFilled;
      byGroup.set(f.group, cur);
    }
    const order = ['Identity', 'Intro', 'Contact', 'Location', 'Profile', 'Social'];
    return order
      .filter((g) => byGroup.has(g))
      .map((g) => {
        const v = byGroup.get(g)!;
        const pct = v.total > 0 ? Math.round((v.earned / v.total) * 100) : 0;
        return { name: g, value: pct };
      });
  }, [breakdown.fields]);

  const handleEdit = () => {
    onOpenChange(false);
    onEditProfile();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90vh,760px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="font-display text-xl sm:text-2xl">Profile strength analysis</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Your meter sums weighted profile fields. Each item below shows how much it contributes to your score when
              filled, what is already strong, and what to add next for the biggest gains.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-1.5 rounded-xl border border-border/60 bg-background/80 px-4 py-2.5 shadow-sm">
              <span className="font-display text-3xl font-semibold tabular-nums text-foreground">{breakdown.percent}</span>
              <span className="text-lg font-medium text-muted-foreground">%</span>
              <span className="ml-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">overall</span>
            </div>
            <p className="min-w-0 max-w-md text-xs text-muted-foreground">
              Model: sum of filled field weights ÷ total weights (same as the gauge). Adding a row below increases your
              meter by up to the listed impact when that field was empty.
            </p>
          </div>
        </div>

        {/* Use flex-1 + min-h-0 so the footer never covers content. */}
        <ScrollArea className="min-h-0 flex-1 px-6">
          <div className="space-y-6 py-5 pr-3 pb-10">
            {/* Dashboard charts */}
            {/* 2 charts per row */}
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/35 to-background p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Profile fields</p>
                <div className="mt-3 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={66}
                        paddingAngle={3}
                        stroke={hexToRgba('#000000', 0)}
                      >
                        {donutData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS.good }} />
                    Filled: <span className="font-semibold text-foreground">{breakdown.strong.length}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS.warn }} />
                    Missing: <span className="font-semibold text-foreground">{breakdown.gaps.length}</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/35 to-background p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Score wave</p>
                <div className="mt-3 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earnedStack} margin={{ left: 6, right: 10, top: 6, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={hexToRgba(CHART_COLORS.muted, 0.25)} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="earned"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2.25}
                        fill={hexToRgba(CHART_COLORS.primary, 0.22)}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="remaining"
                        stroke={hexToRgba(CHART_COLORS.muted, 0.6)}
                        strokeWidth={1.5}
                        fill={hexToRgba(CHART_COLORS.muted, 0.12)}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-foreground">
                    Earned <span className="tabular-nums">{breakdown.percent}%</span>
                    <span className="ml-2 text-xs font-medium text-muted-foreground">in this model</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Fastest upgrades: <span className="font-semibold text-foreground">{breakdown.gaps[0]?.label ?? '—'}</span>
                  </div>
                </div>
              </div>
            </section>

            {topUpgrades.length ? (
              <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/25 to-background p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Top upgrades (highest impact)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fill these first to raise your meter the fastest.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    Impact shown as <span className="text-foreground">+%</span> points
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Upgrade wave
                    </p>
                    <div className="mt-2 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={topUpgrades} margin={{ left: 6, right: 10, top: 6, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke={hexToRgba(CHART_COLORS.muted, 0.22)} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide domain={[0, 'dataMax + 1']} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={CHART_COLORS.warn}
                            strokeWidth={2.25}
                            fill={hexToRgba(CHART_COLORS.warn, 0.22)}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Strength by group
                    </p>
                    <div className="mt-2 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={groupWave} margin={{ left: 6, right: 10, top: 6, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke={hexToRgba(CHART_COLORS.muted, 0.22)} />
                          <XAxis dataKey="name" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={CHART_COLORS.good}
                            strokeWidth={2.25}
                            fill={hexToRgba(CHART_COLORS.good, 0.2)}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {topUpgrades.slice(0, 6).map((u) => (
                    <div key={u.name} className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate font-medium text-foreground">{u.name}</span>
                        <span className="shrink-0 font-bold tabular-nums text-primary">+{u.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Strong points</h3>
                <span className="text-xs text-muted-foreground">(contributing now)</span>
              </div>
              {breakdown.strong.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                  No fields are filled yet. Use the gaps below as a checklist — start with the highest impact lines.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {breakdown.strong.map((f) => (
                    <li
                      key={f.key}
                      className="flex flex-col gap-0.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-3 py-2.5 dark:bg-emerald-500/[0.08]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                        <span className="shrink-0 rounded-md bg-emerald-600/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-800 dark:text-emerald-300">
                          ~{f.pointsIfFilled}% of bar
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{f.group}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            <section>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Priority gaps</h3>
                <span className="text-xs text-muted-foreground">(biggest lift first)</span>
              </div>
              {breakdown.gaps.length === 0 ? (
                <p className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-3 text-sm text-emerald-900 dark:text-emerald-100/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  Everything in this model is filled. Keep info fresh when your story changes.
                </p>
              ) : (
                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {breakdown.gaps.map((f) => (
                    <li
                      key={f.key}
                      className={cn(
                        'rounded-lg border px-3 py-2.5',
                        f.pointsIfFilled >= 8
                          ? 'border-amber-500/25 bg-amber-500/[0.07] dark:bg-amber-500/[0.09]'
                          : 'border-border/60 bg-muted/20',
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{f.label}</span>
                            {f.pointsIfFilled >= 8 ? (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                                <AlertTriangle className="h-3 w-3" aria-hidden />
                                High impact
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">{f.tip}</p>
                        </div>
                        <span className="shrink-0 rounded-md bg-background/80 px-2 py-1 text-xs font-bold tabular-nums text-primary">
                          +up to {f.pointsIfFilled}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">Full field map</h3>
              </div>
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Group</th>
                      <th className="px-3 py-2 font-medium">Impact</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.fields.map((f) => (
                      <tr key={f.key} className="border-b border-border/40 last:border-0">
                        <td className="px-3 py-2 text-foreground">{f.label}</td>
                        <td className="px-3 py-2 text-muted-foreground">{f.group}</td>
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">~{f.pointsIfFilled}%</td>
                        <td className="px-3 py-2">
                          {f.filled ? (
                            <span className="text-emerald-700 dark:text-emerald-400">Filled</span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400">Missing</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:justify-between">
          <p className="text-left text-[11px] text-muted-foreground max-sm:hidden">
            Editing saves to your profile — the meter updates after you save.
          </p>
          <Button type="button" className="w-full rounded-xl sm:w-auto" onClick={handleEdit}>
            Edit profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
