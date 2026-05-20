import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchPastTabContent,
  type PastBroadcastItem,
  type PastTabDataSource,
} from '@/lib/youtube/youtubeChannelBroadcast';
import { YOUTUBE_CHANNEL_ID } from '@/pages/events/config/eveningSatsang';

export type PastSortOrder = 'newest' | 'oldest';

export function usePastBroadcasts(enabled: boolean) {
  const [items, setItems] = useState<PastBroadcastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<PastTabDataSource | null>(null);
  const [usedUploadsFallback, setUsedUploadsFallback] = useState(false);
  const [sortOrder, setSortOrder] = useState<PastSortOrder>('newest');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchPastTabContent(YOUTUBE_CHANNEL_ID);
      setItems(result.items);
      setDataSource(result.source);
      setUsedUploadsFallback(result.usedUploadsFallback);
      setErrorMessage(result.error);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to load');
      setItems([]);
      setDataSource(null);
      setUsedUploadsFallback(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [enabled, load]);

  const sortedItems = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const ta = new Date(a.publishedAt).getTime();
      const tb = new Date(b.publishedAt).getTime();
      if (sortOrder === 'newest') return tb - ta;
      return ta - tb;
    });
    return copy;
  }, [items, sortOrder]);

  return {
    items: sortedItems,
    loading,
    errorMessage,
    dataSource,
    usedUploadsFallback,
    sortOrder,
    setSortOrder,
    refresh: load,
  };
}
