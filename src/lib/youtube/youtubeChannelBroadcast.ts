/**
 * YouTube Data API v3 — channel live + scheduled broadcasts only.
 * No local “fake” schedule: if the channel has nothing upcoming/live, callers get idle.
 *
 * API access:
 * - If `VITE_YOUTUBE_API_KEY` is set, calls Google directly from the browser.
 * - Otherwise, calls same-origin `/api/v1/youtube/v3/*` (backend adds `YOUTUBE_API_KEY` from backend/.env).
 * - If the Data API is unavailable or not configured, falls back to `/api/v1/youtube/rss/videos`
 *   (public Atom feed — no API key).
 *
 * **Live / scheduled detection:** `search.list` often misses streams that the channel feed already lists.
 * We therefore prefer **RSS order + `videos.list`** (`snippet.liveBroadcastContent`) and use `search.list` as a fallback.
 *
 * We only show **Current** when the Data API says `live` or `upcoming` with a **future** scheduled time — no title/RSS guessing,
 * so finished streams (still titled “Watch LIVE” in the feed) do not appear as live.
 */

import { getApiBaseUrl } from '@/lib/api/client';

/** Same shape as RSS and search snippets — shared by Past tab and live detection. */
export type PastBroadcastItem = {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  /** ISO 8601 from snippet.publishedAt */
  publishedAt: string;
};

export type ChannelBroadcastSnapshot =
  | { kind: 'idle' }
  | {
      kind: 'live';
      videoId: string;
      title: string;
      description: string;
      thumbnailUrl: string;
      actualStartTime?: string;
    }
  | {
      kind: 'scheduled';
      videoId: string;
      title: string;
      description: string;
      thumbnailUrl: string;
      /** ISO 8601 from liveStreamingDetails — required to show a scheduled countdown */
      scheduledStartTime: string;
    };

type SearchItem = {
  id?: { videoId?: string };
  snippet?: { title?: string; description?: string };
};

type VideoResource = {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    /** Present when part=snippet on videos.list — most reliable for live vs upload. */
    liveBroadcastContent?: 'live' | 'none' | 'upcoming';
    thumbnails?: {
      maxres?: { url?: string };
      standard?: { url?: string };
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
  };
};

function getYoutubeV3BaseUrl(): string {
  const viteKey = (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim();
  if (viteKey) return 'https://www.googleapis.com/youtube/v3';
  return `${getApiBaseUrl()}/youtube/v3`;
}

function usesClientYoutubeKey(): boolean {
  return Boolean((import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim());
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Retries transient upstream failures (Google or proxy). */
async function youtubeV3Get(
  resource: 'search' | 'videos',
  params: URLSearchParams
): Promise<Response> {
  const base = getYoutubeV3BaseUrl();
  const viteKey = (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)?.trim();
  if (usesClientYoutubeKey() && viteKey) {
    params.set('key', viteKey);
  }
  const url = `${base}/${resource}?${params}`;
  let last: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    last = res;
    if (res.ok) return res;
    if (![502, 503, 504, 429].includes(res.status)) return res;
    if (attempt < 2) await sleep(320 * (attempt + 1));
  }
  return last!;
}

/** Scheduled card only if start is still in the future (small skew for clocks). */
function isScheduledStartStillUpcoming(iso: string): boolean {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return t > Date.now() - 60_000;
}

function pickThumbnail(snippet: VideoResource['snippet']): string {
  if (!snippet?.thumbnails) return '';
  const t = snippet.thumbnails;
  return (
    t.maxres?.url ??
    t.standard?.url ??
    t.high?.url ??
    t.medium?.url ??
    ''
  );
}

async function searchFirstVideoId(
  channelId: string,
  eventType: 'live' | 'upcoming'
): Promise<string | null> {
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    type: 'video',
    eventType,
    maxResults: '1',
  });
  const res = await youtubeV3Get('search', params);
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: SearchItem[] };
  const id = data.items?.[0]?.id?.videoId;
  return id ?? null;
}

async function fetchVideoDetails(videoId: string): Promise<VideoResource | null> {
  const params = new URLSearchParams({
    part: 'snippet,liveStreamingDetails',
    id: videoId,
  });
  const res = await youtubeV3Get('videos', params);
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: VideoResource[] };
  return data.items?.[0] ?? null;
}

async function fetchPastItemsFromChannelRss(channelId: string): Promise<PastBroadcastItem[] | null> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = `${base}/youtube/rss/videos?${new URLSearchParams({ channelId })}`;
  const tryOnce = async (): Promise<{ items: PastBroadcastItem[] | null; retryable: boolean }> => {
    const res = await fetch(url);
    let data: { items?: PastBroadcastItem[] };
    try {
      data = (await res.json()) as { items?: PastBroadcastItem[] };
    } catch {
      return { items: null, retryable: [502, 503, 504, 429].includes(res.status) };
    }
    if (res.ok && data.items?.length) return { items: data.items, retryable: false };
    return {
      items: null,
      retryable: !res.ok && [502, 503, 504, 429].includes(res.status),
    };
  };
  try {
    const a = await tryOnce();
    if (a.items?.length) return a.items;
    if (!a.retryable) return null;
    await sleep(450);
    const b = await tryOnce();
    return b.items?.length ? b.items : null;
  } catch {
    return null;
  }
}

function broadcastSnapshotFromLiveVideo(v: VideoResource, videoId: string): ChannelBroadcastSnapshot {
  const title = v.snippet?.title?.trim() || 'Live';
  const description = v.snippet?.description ?? '';
  const thumbnailUrl = pickThumbnail(v.snippet) || '';
  return {
    kind: 'live',
    videoId,
    title,
    description,
    thumbnailUrl,
    actualStartTime: v.liveStreamingDetails?.actualStartTime,
  };
}

/**
 * Walk recent RSS entries and check `videos.list` for `liveBroadcastContent` — aligns with what the channel is
 * actually streaming; `search.list` alone often returns empty while a stream is live.
 */
async function snapshotFromRssAndVideoDetails(channelId: string): Promise<ChannelBroadcastSnapshot> {
  const rssItems = await fetchPastItemsFromChannelRss(channelId);
  if (!rssItems?.length) return { kind: 'idle' };

  let bestUp: { v: VideoResource; videoId: string } | null = null;

  for (const row of rssItems.slice(0, 12)) {
    const v = await fetchVideoDetails(row.videoId);
    if (!v?.id || !v.snippet) continue;

    const bc = v.snippet.liveBroadcastContent;
    if (bc === 'live') {
      return broadcastSnapshotFromLiveVideo(v, v.id);
    }
    if (bc === 'upcoming') {
      const sched = v.liveStreamingDetails?.scheduledStartTime;
      if (sched && isScheduledStartStillUpcoming(sched)) {
        const t = new Date(sched).getTime();
        const prev = bestUp
          ? new Date(bestUp.v.liveStreamingDetails?.scheduledStartTime ?? 0).getTime()
          : Infinity;
        if (!bestUp || t < prev) bestUp = { v, videoId: v.id };
      }
    }
  }

  if (bestUp) {
    const v = bestUp.v;
    const scheduled = v.liveStreamingDetails?.scheduledStartTime;
    if (scheduled && isScheduledStartStillUpcoming(scheduled)) {
      return {
        kind: 'scheduled',
        videoId: bestUp.videoId,
        title: v.snippet?.title?.trim() || 'Scheduled live',
        description: v.snippet?.description ?? '',
        thumbnailUrl: pickThumbnail(v.snippet) || '',
        scheduledStartTime: scheduled,
      };
    }
  }

  return { kind: 'idle' };
}

/**
 * Live first (RSS + videos.list), then scheduled, then `search.list` fallback when the index is slow.
 */
export async function fetchChannelBroadcastSnapshot(channelId: string): Promise<ChannelBroadcastSnapshot> {
  const fromFeed = await snapshotFromRssAndVideoDetails(channelId);
  if (fromFeed.kind !== 'idle') return fromFeed;

  const liveId = await searchFirstVideoId(channelId, 'live');
  if (liveId) {
    const v = await fetchVideoDetails(liveId);
    if (v?.id && v.snippet?.liveBroadcastContent === 'live') {
      return broadcastSnapshotFromLiveVideo(v, liveId);
    }
  }

  const upcomingId = await searchFirstVideoId(channelId, 'upcoming');
  if (!upcomingId) {
    return { kind: 'idle' };
  }

  const v = await fetchVideoDetails(upcomingId);
  const scheduled = v?.liveStreamingDetails?.scheduledStartTime;
  if (
    !v?.id ||
    v.snippet?.liveBroadcastContent !== 'upcoming' ||
    !scheduled ||
    !isScheduledStartStillUpcoming(scheduled)
  ) {
    return { kind: 'idle' };
  }

  const title = v.snippet?.title?.trim() || 'Scheduled live';
  const description = v.snippet?.description ?? '';
  const thumbnailUrl = pickThumbnail(v.snippet) || '';

  return {
    kind: 'scheduled',
    videoId: upcomingId,
    title,
    description,
    thumbnailUrl,
    scheduledStartTime: scheduled,
  };
}

export function getYoutubeEmbedUrl(videoId: string, opts?: { modestBranding?: boolean }): string {
  const q = new URLSearchParams({
    rel: '0',
    modestbranding: opts?.modestBranding !== false ? '1' : '0',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`;
}

type SearchVideoSnippet = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YoutubeApiErrorBody = {
  error?: { message?: string; errors?: Array<{ message?: string }> };
};

function stripYoutubeErrorHtml(message: string): string {
  return message.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function parseYoutubeListError(data: unknown, httpStatus: number): string | null {
  const body = data as YoutubeApiErrorBody;
  const raw = body?.error?.message ?? body?.error?.errors?.[0]?.message;
  if (raw) return stripYoutubeErrorHtml(raw);
  if (httpStatus >= 400) return `YouTube API error (HTTP ${httpStatus})`;
  return null;
}

function mapSearchToPastItems(rows: SearchVideoSnippet[] | undefined): PastBroadcastItem[] {
  return (rows ?? [])
    .map((row) => {
      const videoId = row.id?.videoId;
      const sn = row.snippet;
      if (!videoId || !sn?.title) return null;
      const t = sn.thumbnails;
      const thumbnailUrl =
        t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? '';
      return {
        videoId,
        title: sn.title.trim(),
        description: sn.description ?? '',
        thumbnailUrl,
        publishedAt: sn.publishedAt ?? new Date(0).toISOString(),
      } satisfies PastBroadcastItem;
    })
    .filter((x): x is PastBroadcastItem => x != null);
}

/**
 * Past / completed broadcasts for a channel. Often returns **zero rows** even when the channel
 * has archives — YouTube only tags some videos as “completed broadcast”.
 */
export async function fetchCompletedBroadcasts(
  channelId: string,
  opts?: { maxResults?: number; pageToken?: string }
): Promise<{ items: PastBroadcastItem[]; nextPageToken?: string; error?: string }> {
  const max = Math.min(Math.max(opts?.maxResults ?? 25, 1), 50);
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    type: 'video',
    eventType: 'completed',
    order: 'date',
    maxResults: String(max),
  });
  if (opts?.pageToken) params.set('pageToken', opts.pageToken);

  const res = await youtubeV3Get('search', params);
  const data = (await res.json()) as {
    items?: SearchVideoSnippet[];
    nextPageToken?: string;
  } & YoutubeApiErrorBody;

  if (!res.ok) {
    const err = parseYoutubeListError(data, res.status);
    return { items: [], error: err ?? 'Request failed' };
  }

  return {
    items: mapSearchToPastItems(data.items),
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Recent channel uploads (all video types). Reliable fallback when `completed` returns nothing.
 */
export async function fetchRecentChannelVideos(
  channelId: string,
  opts?: { maxResults?: number; pageToken?: string }
): Promise<{ items: PastBroadcastItem[]; nextPageToken?: string; error?: string }> {
  const max = Math.min(Math.max(opts?.maxResults ?? 25, 1), 50);
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults: String(max),
  });
  if (opts?.pageToken) params.set('pageToken', opts.pageToken);

  const res = await youtubeV3Get('search', params);
  const data = (await res.json()) as {
    items?: SearchVideoSnippet[];
    nextPageToken?: string;
  } & YoutubeApiErrorBody;

  if (!res.ok) {
    const err = parseYoutubeListError(data, res.status);
    return { items: [], error: err ?? 'Request failed' };
  }

  return {
    items: mapSearchToPastItems(data.items),
    nextPageToken: data.nextPageToken,
  };
}

export type PastTabDataSource = 'completed' | 'uploads';

export type PastTabFetchResult = {
  items: PastBroadcastItem[];
  source: PastTabDataSource;
  /** API failure (key, quota, API not enabled, etc.) */
  error: string | null;
  /** True when we used uploads because completed was empty (not an error). */
  usedUploadsFallback: boolean;
};

/**
 * Past tab: try completed live first; if empty or first call errors, use recent uploads (same quota cost per call).
 */
async function fetchPastTabContentViaDataApi(channelId: string): Promise<PastTabFetchResult> {
  const completed = await fetchCompletedBroadcasts(channelId, { maxResults: 30 });

  if (completed.error) {
    const uploads = await fetchRecentChannelVideos(channelId, { maxResults: 30 });
    if (uploads.error) {
      return {
        items: [],
        source: 'uploads',
        error:
          completed.error === uploads.error
            ? completed.error
            : `${completed.error} · Uploads fallback: ${uploads.error}`,
        usedUploadsFallback: false,
      };
    }
    return {
      items: uploads.items,
      source: 'uploads',
      error: null,
      usedUploadsFallback: true,
    };
  }

  if (completed.items.length > 0) {
    return {
      items: completed.items,
      source: 'completed',
      error: null,
      usedUploadsFallback: false,
    };
  }

  const uploads = await fetchRecentChannelVideos(channelId, { maxResults: 30 });
  if (uploads.error) {
    return {
      items: [],
      source: 'uploads',
      error: uploads.error,
      usedUploadsFallback: false,
    };
  }

  return {
    items: uploads.items,
    source: 'uploads',
    error: null,
    usedUploadsFallback: true,
  };
}

/**
 * Past tab: Data API first; if that yields no rows (or errors), use public RSS feed via backend (no API key).
 */
export async function fetchPastTabContent(channelId: string): Promise<PastTabFetchResult> {
  const viaApi = await fetchPastTabContentViaDataApi(channelId);
  if (viaApi.items.length > 0) {
    return viaApi;
  }
  const rssItems = await fetchPastItemsFromChannelRss(channelId);
  if (rssItems && rssItems.length > 0) {
    return {
      items: rssItems,
      source: 'uploads',
      error: null,
      usedUploadsFallback: true,
    };
  }
  return viaApi;
}
