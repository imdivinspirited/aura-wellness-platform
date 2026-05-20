import type { Event } from '@/pages/events/types';
import { getAbsoluteSiteUrl } from '@/lib/routes';

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function formatIcsUtc(instant: Date): string {
  const y = instant.getUTCFullYear();
  const m = String(instant.getUTCMonth() + 1).padStart(2, '0');
  const d = String(instant.getUTCDate()).padStart(2, '0');
  const h = String(instant.getUTCHours()).padStart(2, '0');
  const min = String(instant.getUTCMinutes()).padStart(2, '0');
  const s = String(instant.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

function formatIcsAllDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function locationLine(event: Event): string {
  if (event.location.hybrid) {
    const p = [event.location.name, event.location.city, event.location.country].filter(Boolean);
    return p.length ? `${p.join(', ')} · global webcast` : 'Bangalore International Centre & online';
  }
  if (event.location.online) return 'Online — worldwide';
  const p = [event.location.name, event.location.city, event.location.country].filter(Boolean);
  return p.join(', ');
}

/**
 * Build an iCalendar document for the given events (e.g. current filter).
 * Users can open the file in Apple Calendar, Google Calendar, Outlook, etc.
 */
export function buildEventsIcs(events: Event[], calendarName: string): string {
  const stamp = formatIcsUtc(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'PRODID:-//The AOLIC Bangalore//Events//EN',
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
  ];

  for (const event of events) {
    const url = getAbsoluteSiteUrl(`/events/${event.slug}`);
    const summary = escapeIcs(event.title);
    const desc = escapeIcs(`${event.shortDescription || event.description}\n\n${url}`);
    const loc = escapeIcs(locationLine(event));
    const uid = `${event.id}@events.aolic-bangalore`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`URL:${url}`);

    if (event.isAllDay) {
      const start = formatIcsAllDay(new Date(event.startDate));
      const endD = new Date(event.endDate);
      endD.setDate(endD.getDate() + 1);
      const end = formatIcsAllDay(endD);
      lines.push(`DTSTART;VALUE=DATE:${start}`);
      lines.push(`DTEND;VALUE=DATE:${end}`);
    } else {
      lines.push(`DTSTART:${formatIcsUtc(new Date(event.startDate))}`);
      lines.push(`DTEND:${formatIcsUtc(new Date(event.endDate))}`);
    }

    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push(`LOCATION:${loc}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(filename: string, body: string): void {
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
