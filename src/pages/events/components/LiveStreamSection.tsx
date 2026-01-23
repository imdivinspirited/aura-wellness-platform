/**
 * Live Stream Section Component
 * 
 * Displays YouTube live streaming embed with error handling.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Event } from '../types';

interface LiveStreamSectionProps {
  event: Event;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function LiveStreamSection({ event }: LiveStreamSectionProps) {
  if (!event.liveStreamUrl) {
    return null;
  }

  const videoId = getYouTubeVideoId(event.liveStreamUrl);

  if (!videoId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Live Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid YouTube URL. Please check the live stream link.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Watch Live
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
            title={`Live stream: ${event.title}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Join us live for {event.title}. The stream will begin automatically when available.
        </p>
      </CardContent>
    </Card>
  );
}
