import { useEffect, useState } from 'react';

/**
 * Periodically increments so list pages can re-derive upcoming / ongoing / past
 * from `endDate` without a full reload.
 */
export function useEventsClock(intervalMs = 30_000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return tick;
}
