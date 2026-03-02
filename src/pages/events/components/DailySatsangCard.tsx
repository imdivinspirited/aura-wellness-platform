import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';

/**
 * Daily Satsang Card
 *
 * Always visible card with a stable embed.
 * Time: 6:30 PM – 8:00 PM (Asia/Kolkata)
 */
export function DailySatsangCard({
  youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
}: {
  youtubeUrl?: string;
}) {
  return (
    <Card className="border-stone-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-xl font-light text-stone-900">Daily Satsang</div>
            <div className="text-sm text-muted-foreground">6:30 PM – 8:00 PM • Asia/Kolkata</div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20">Live</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <YouTubeEmbed url={youtubeUrl} title="Daily Satsang" />
      </CardContent>
    </Card>
  );
}

