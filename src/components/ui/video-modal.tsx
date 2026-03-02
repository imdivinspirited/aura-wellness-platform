/**
 * Video Modal Component
 *
 * Modal for playing videos (YouTube or self-hosted).
 * Lazy-loads video content.
 */

import { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl?: string;
  videoId?: string; // YouTube video ID
  title?: string;
  description?: string;
}

export function VideoModal({
  open,
  onOpenChange,
  videoUrl,
  videoId,
  title = 'Watch Video',
  description,
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Default video: Art of Living introduction
  const defaultVideoId = videoId || 'dQw4w9WgXcQ'; // Replace with actual AOL video ID
  const youtubeUrl = `https://www.youtube.com/embed/${defaultVideoId}?autoplay=1&rel=0`;

  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="relative bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Video Container */}
          <div className="relative aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white">
                  <Play className="h-16 w-16 animate-pulse" />
                </div>
              </div>
            )}
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full"
                onLoadedData={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : (
              <iframe
                src={youtubeUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>

          {/* Video Info */}
          {(title || description) && (
            <div className="p-6 bg-background">
              {title && (
                <DialogTitle className="text-xl font-semibold mb-2">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
