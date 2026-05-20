/**
 * useAnalytics — Dashboard analytics from backend.
 */

import { useState, useCallback, useEffect } from 'react';
import { getAnalytics } from '@/lib/chat/backendChatApi';

export type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

export function useAnalytics(sessionId: string | null) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!sessionId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getAnalytics();
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, refetch: fetchAnalytics };
}
