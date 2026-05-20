import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { postMoodActivityFeedback } from '@/lib/api/mood';
import { useUserStore, type MoodType } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const MOOD_ORDER: NonNullable<MoodType>[] = ['happy', 'calm', 'neutral', 'sad', 'depressed', 'stressed'];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beforeMood: NonNullable<MoodType>;
  activityTitle: string;
  youtubeVideoId?: string;
};

export function MoodActivityFeedbackDialog({
  open,
  onOpenChange,
  beforeMood,
  activityTitle,
  youtubeVideoId,
}: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const setMood = useUserStore((s) => s.setMood);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [improvement, setImprovement] = useState(45);
  const [afterKey, setAfterKey] = useState<string>('__skip__');

  useEffect(() => {
    if (open) {
      setImprovement(45);
      setAfterKey('__skip__');
    }
  }, [open, beforeMood]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const after_mood =
        afterKey === '__skip__' ? null : (afterKey as NonNullable<MoodType>);
      await postMoodActivityFeedback({
        before_mood: beforeMood,
        after_mood,
        improvement_percent: improvement,
        activity_type: 'meditation',
        activity_title: activityTitle,
        youtube_video_id: youtubeVideoId,
      });
    },
    onSuccess: () => {
      const after_mood =
        afterKey === '__skip__' ? null : (afterKey as NonNullable<MoodType>);
      if (after_mood) {
        setMood(after_mood);
      }
      void qc.invalidateQueries({ queryKey: ['mood', 'summary'] });
      void qc.invalidateQueries({ queryKey: ['me', 'profile-full'] });
      void qc.invalidateQueries({ queryKey: ['mood', 'activity-feedback', 'recent'] });
      toast.success(
        isAuthenticated
          ? (t('mood.wellness.feedbackSuccess' as any) as string)
          : (t('mood.wellness.feedbackSuccessGuest' as any) as string)
      );
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not save feedback');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,720px)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t('mood.wellness.feedbackTitle' as any)}</DialogTitle>
          <DialogDescription>{t('mood.wellness.feedbackSubtitle' as any)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{activityTitle}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>{t('mood.wellness.improvementLabel' as any)}</Label>
              <span className="tabular-nums text-sm font-semibold text-primary">{improvement}%</span>
            </div>
            <Slider
              value={[improvement]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setImprovement(v[0] ?? 0)}
              className="py-1"
            />
            <p className="text-xs text-muted-foreground">{t('mood.wellness.improvementHint' as any)}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('mood.wellness.afterMoodLabel' as any)}</Label>
            <Select value={afterKey} onValueChange={setAfterKey}>
              <SelectTrigger>
                <SelectValue placeholder={t('mood.wellness.afterMoodPlaceholder' as any)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__skip__">{t('mood.wellness.afterMoodSkip' as any)}</SelectItem>
                {MOOD_ORDER.map((m) => (
                  <SelectItem key={m} value={m}>
                    {t(`mood.modal.moods.${m}.label` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? t('common.loading') : t('mood.wellness.submitFeedback' as any)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
