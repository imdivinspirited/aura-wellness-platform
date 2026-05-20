import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getYoutubeEmbedUrl } from '@/lib/youtube/youtubeChannelBroadcast';

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

type LocationState = { title?: string; publishedAt?: string };

function formatPublished(iso: string | undefined) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return null;
  }
}

/**
 * In-site playback for IC channel archive videos (Past tab). YouTube opens only via explicit external link.
 */
export function ChannelYoutubeWatchPage() {
  const { videoId = '' } = useParams<{ videoId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const title = (state.title?.trim() || 'Art of Living International Center').slice(0, 500);
  const publishedLine = formatPublished(state.publishedAt);
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  const valid = YOUTUBE_ID_RE.test(videoId);
  const embedSrc = valid ? getYoutubeEmbedUrl(videoId) : '';

  return (
    <MainLayout>
      <div className="container max-w-4xl space-y-6 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
            <Link to="/events">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to events
            </Link>
          </Button>
        </div>

        {!valid ? (
          <p className="text-sm text-muted-foreground">
            Invalid video link.{' '}
            <Link to="/events" className="font-medium text-primary underline-offset-4 hover:underline">
              Return to events
            </Link>
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-light tracking-tight text-foreground md:text-3xl">
                {title}
              </h1>
              {publishedLine ? (
                <p className="text-sm text-muted-foreground">{publishedLine}</p>
              ) : null}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black shadow-lg">
              <div className="aspect-video w-full">
                <iframe
                  src={embedSrc}
                  title={title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer">
                  Open on YouTube
                  <ExternalLink className="ml-2 h-4 w-4 opacity-80" aria-hidden />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
