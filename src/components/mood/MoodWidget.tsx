import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMoodSummary, postMood, type MoodValue } from '@/lib/api/mood';
import { toast } from 'sonner';

const MOODS: Array<{ value: MoodValue; label: string }> = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'stressed', label: 'Stressed' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'sad', label: 'Sad' },
  { value: 'angry', label: 'Angry' },
  { value: 'tired', label: 'Tired' },
];

export function MoodWidget() {
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  const summaryQ = useQuery({
    queryKey: ['mood', 'summary', 30],
    queryFn: () => getMoodSummary({ days: 30 }) as Promise<any>,
  });

  const latestMood = summaryQ.data?.data?.latest?.mood as MoodValue | undefined;
  const counts = summaryQ.data?.data?.counts as Record<string, number> | undefined;

  const top = useMemo(() => {
    if (!counts) return [];
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [counts]);

  const postM = useMutation({
    mutationFn: async (mood: MoodValue) => postMood({ mood, note: note.trim() || undefined }),
    onSuccess: async () => {
      setNote('');
      await qc.invalidateQueries({ queryKey: ['mood', 'summary', 30] });
      toast.success('Mood saved');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to save mood'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood check-in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          Latest: <span className="font-medium">{latestMood || '—'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOODS.map((m) => (
            <Button
              key={m.value}
              variant={latestMood === m.value ? 'default' : 'outline'}
              onClick={() => postM.mutate(m.value)}
              disabled={postM.isPending}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note (private)" />

        {top.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Top moods (30d): {top.map(([k, v]) => `${k} (${v})`).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

