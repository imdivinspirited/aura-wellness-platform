import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getMoodActivityFeedbackRecent, type MoodActivityFeedbackRow } from '@/lib/api/mood';
import { useTranslation } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

type Props = {
  wellnessMood?: string;
  wellnessMoodUpdatedAt?: string;
  wellnessLastImprovementPercent?: number;
};

function formatLine(template: string, moodLabel: string, pct: number | undefined): string {
  const pctStr = pct != null && !Number.isNaN(pct) ? String(pct) : '—';
  return template.replace('{{mood}}', moodLabel).replace('{{pct}}', pctStr);
}

export function WellnessMoodProfileCard({
  wellnessMood,
  wellnessMoodUpdatedAt,
  wellnessLastImprovementPercent,
}: Props) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const recentQ = useQuery({
    queryKey: ['mood', 'activity-feedback', 'recent'],
    queryFn: () => getMoodActivityFeedbackRecent(6),
    enabled: isAuthenticated,
  });

  const rows = recentQ.data ?? [];

  const moodLabel = wellnessMood
    ? (t(`mood.modal.moods.${wellnessMood}.label` as any) as string)
    : '';

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/15">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Heart className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <CardTitle className="font-display text-lg">{t('mood.wellness.profileCardTitle' as any)}</CardTitle>
            <CardDescription>
              {wellnessMood ? (
                <>
                  {formatLine(
                    t('mood.wellness.profileCardLine' as any) as string,
                    moodLabel,
                    wellnessLastImprovementPercent
                  )}
                  {wellnessMoodUpdatedAt ? (
                    <span className="mt-1 block text-xs opacity-80">
                      {new Date(wellnessMoodUpdatedAt).toLocaleString()}
                    </span>
                  ) : null}
                </>
              ) : (
                t('mood.wellness.profileCardEmpty' as any)
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {rows.length > 0 && (
        <CardContent className="space-y-2 border-t border-border/50 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('mood.wellness.recentSessions' as any)}
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {rows.map((r: MoodActivityFeedbackRow) => (
              <li key={r.id} className="flex flex-col gap-0.5 rounded-md border border-border/40 bg-background/50 px-3 py-2">
                <span className="font-medium text-foreground">{r.activity_title || r.activity_type || 'Session'}</span>
                <span className="text-xs">
                  +{r.improvement_percent}% ·{' '}
                  {r.after_mood
                    ? (t(`mood.modal.moods.${r.after_mood}.label` as any) as string)
                    : '—'}
                  {' · '}
                  {new Date(r.recorded_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/" className="inline-block text-xs font-medium text-primary hover:underline">
            {t('nav.home' as any)} — {t('home.index.forYou' as any)}
          </Link>
        </CardContent>
      )}
    </Card>
  );
}
