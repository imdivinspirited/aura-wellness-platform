/**
 * Videos & Talks - Video Player
 *
 * Video player with transcript section.
 */

import { useState } from 'react';
import { Clock, Eye, User, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Video } from '../../types';

interface VideoPlayerProps {
  video: Video;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
};

/**
 * Convert YouTube URL to embed format
 */
function getYouTubeEmbedUrl(url: string): string {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }

  // Fallback: try simple replacement
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/').split('&')[0] + '?rel=0&modestbranding=1';
  }

  return url;
}

export const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = getYouTubeEmbedUrl(video.url);

  return (
    <div>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load video. Please check your internet connection or try again later.
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white animate-pulse">Loading video...</div>
              </div>
            )}
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
            />
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              {video.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatViews(video.views)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(video.duration)}
              </div>
              <Badge>{video.category.name}</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">{video.description}</p>

        {/* Speaker Info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <Avatar className="h-12 w-12">
            <AvatarImage src={video.speaker.avatar} />
            <AvatarFallback>{video.speaker.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{video.speaker.name}</p>
            <p className="text-sm text-muted-foreground">{video.speaker.role}</p>
          </div>
        </div>

        {/* Transcript Section */}
        {video.transcript && (
          <div>
            <Button
              variant="outline"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full mb-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
              {showTranscript ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            {showTranscript && (
              <div className="bg-muted/50 p-6 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{video.transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
