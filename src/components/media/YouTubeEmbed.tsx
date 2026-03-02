import * as React from 'react';
import { cn } from '@/lib/utils';

function extractYouTubeId(url: string): string | null {
  try {
    // Support youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/live/<id>, youtube.com/embed/<id>
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '') || null;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      const liveIdx = parts.indexOf('live');
      if (liveIdx >= 0 && parts[liveIdx + 1]) return parts[liveIdx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({
  url,
  title,
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const id = extractYouTubeId(url);
  if (!id) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl border bg-black', className)}>
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title || 'YouTube video'}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

