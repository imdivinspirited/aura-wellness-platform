/**
 * Videos & Talks - Video Player
 *
 * Video player with transcript section.
 */

import { useState } from 'react';
import { Clock, Eye, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <iframe
          src={video.url.replace('watch?v=', 'embed/')}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
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
