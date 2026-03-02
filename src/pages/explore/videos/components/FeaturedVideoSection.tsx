/**
 * Videos & Talks - Featured Video Section
 *
 * Large featured video player.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Eye, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Video } from '../../types';

interface FeaturedVideoSectionProps {
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

export const FeaturedVideoSection = ({ video }: FeaturedVideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-7xl">
        <div className="mb-6">
          <Badge className="mb-3">Featured</Badge>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Featured Video</h2>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-64 md:h-96 lg:h-[500px] bg-muted">
            {!isPlaying ? (
              <>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-20 w-20"
                    onClick={() => setIsPlaying(true)}
                    aria-label="Play video"
                  >
                    <Play className="h-10 w-10 ml-1" fill="currentColor" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-4 mb-2">
                    <Badge className="bg-primary">{video.category.name}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-4 w-4" />
                      {formatViews(video.views)}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                    {video.title}
                  </h3>
                  <p className="text-white/90 line-clamp-2">{video.description}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full">
                <iframe
                  src={video.url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={video.speaker.avatar} />
                <AvatarFallback>{video.speaker.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{video.speaker.name}</p>
                <p className="text-sm text-muted-foreground">{video.speaker.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
