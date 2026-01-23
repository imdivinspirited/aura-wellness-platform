/**
 * Videos & Talks - Video Card
 *
 * Netflix-style video card with thumbnail overlay.
 */

import { useState } from 'react';
import { Play, Clock, Eye, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Video } from '../../types';

interface VideoCardProps {
  video: Video;
  onPlay?: (video: Video) => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

export const VideoCard = ({ video, onPlay }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay?.(video)}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-primary rounded-full p-4">
            <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-black/70 text-white">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-display text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {video.speaker.name}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {video.category.name}
        </Badge>
      </CardContent>
    </Card>
  );
};
