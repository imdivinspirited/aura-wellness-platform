import { useCallback, useEffect, useState } from 'react';
import {
  fetchChannelBroadcastSnapshot,
  type ChannelBroadcastSnapshot,
} from '@/lib/youtube/youtubeChannelBroadcast';
import { YOUTUBE_CHANNEL_ID } from '@/pages/events/config/eveningSatsang';

/**
 * Default 2 min — live detection uses RSS + `videos.list` first (~few units/poll), not only `search.list` (200/poll).
 * Override with `VITE_YOUTUBE_POLL_MS` if you need to ease quota.
 */
const DEFAULT_POLL_MS = 2 * 60 * 1000;

export type UseYoutubeChannelBroadcastResult = {
  snapshot: ChannelBroadcastSnapshot;
  loading: boolean;
  error: boolean;
  refresh: () => void;
};

/**
 * Polls YouTube for live first, then scheduled — mirrors channel state only (no local fake schedule).
 * Uses VITE_YOUTUBE_API_KEY when set, else `/api/v1/youtube/v3` with YOUTUBE_API_KEY on the server.
 */
function parsePollMs(): number {
  const raw = import.meta.env.VITE_YOUTUBE_POLL_MS as string | undefined;
  if (!raw?.trim()) return DEFAULT_POLL_MS;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 60_000 ? n : DEFAULT_POLL_MS;
}

export function useYoutubeChannelBroadcast(): UseYoutubeChannelBroadcastResult {
  const pollMs = parsePollMs();
  const [snapshot, setSnapshot] = useState<ChannelBroadcastSnapshot>({ kind: 'idle' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const next = await fetchChannelBroadcastSnapshot(YOUTUBE_CHANNEL_ID);
      setSnapshot(next);
    } catch {
      setError(true);
      setSnapshot({ kind: 'idle' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    const id = window.setInterval(run, pollMs);
    return () => window.clearInterval(id);
  }, [run, pollMs]);

  return { snapshot, loading, error, refresh: run };
}
