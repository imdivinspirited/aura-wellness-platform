/**
 * Modal that embeds a YouTube video via iframe only.
 * No video files are stored or served from our servers — streaming is entirely from YouTube.
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
import { HERO_WELCOME_YOUTUBE_ID } from '@/lib/heroWelcomeVideo';

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** YouTube video id (e.g. from watch?v=XXXX). Defaults to hero welcome id. */
  videoId?: string;
  title?: string;
  description?: string;
}

export function VideoModal({
  open,
  onOpenChange,
  videoId,
  title = 'Watch Video',
  description,
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const id = videoId || HERO_WELCOME_YOUTUBE_ID;
  const youtubeUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`;

  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-4xl p-0 gap-0 overflow-hidden">
        <div className="relative bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-3 z-[60] rounded-full bg-black/60 hover:bg-black/80 text-white shadow-md ring-1 ring-white/10 sm:left-4 sm:top-4"
            onClick={() => onOpenChange(false)}
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="relative aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-white">
                  <Play className="h-16 w-16 animate-pulse" />
                </div>
              </div>
            )}
            <iframe
              src={youtubeUrl}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {(title || description) && (
            <div className="bg-background p-6">
              {title && (
                <DialogTitle className="mb-2 text-xl font-semibold">
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
