import type { Event } from '@/pages/events/types';

export function formatLocationLine(event: Event): string {
  if (event.location.hybrid) {
    const parts = [event.location.name, event.location.city, event.location.country].filter(Boolean);
    const venue = parts.join(' · ');
    return venue ? `${venue} · global webcast` : 'Bangalore ashram & global webcast';
  }
  if (event.location.online) return 'Worldwide — online';
  const parts = [event.location.name, event.location.city, event.location.country].filter(Boolean);
  return parts.join(' · ');
}

/** Gurudev birthday uses lakh-style copy; other events use locale number + expected. */
export function formatExpectedAttendeesHero(event: Event, count: number): string {
  if (event.slug === 'gurudev-birthday-2026') {
    const lakh = count / 100_000;
    const decimals = lakh % 1 === 0 ? 0 : 1;
    return `${lakh.toFixed(decimals)} lakh+ expected`;
  }
  return `${count.toLocaleString()}+ expected`;
}
