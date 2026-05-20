import * as React from 'react';
import { useCallback, useState } from 'react';
import { Bell, CalendarPlus, Check, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Event } from '@/pages/events/types';
import { buildEventsIcs, downloadIcsFile } from '@/pages/events/utils/calendarExport';
import { getAbsoluteSiteUrl } from '@/lib/routes';
import { submitEventInterest } from '@/lib/api/eventInterest';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'aolic:gurudev-birthday-2026:interest';

type StoredEntry = {
  at: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  vibe?: string;
  note?: string;
  updatesOk?: boolean;
};

type StoredShape = { version: 1; entries: StoredEntry[] };

const VIBES = [
  { id: 'ashram', label: 'At the International Center' },
  { id: 'online', label: 'Online / from home' },
  { id: 'local', label: 'With local sangha' },
] as const;

function loadStored(): StoredShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, entries: [] };
    const parsed = JSON.parse(raw) as StoredShape;
    if (!parsed.entries || !Array.isArray(parsed.entries)) return { version: 1, entries: [] };
    return parsed;
  } catch {
    return { version: 1, entries: [] };
  }
}

function saveEntry(entry: Omit<StoredEntry, 'at'> & { at?: string }) {
  const data = loadStored();
  const at = entry.at ?? new Date().toISOString();
  const next: StoredEntry = {
    at,
    name: entry.name.trim(),
    email: entry.email.trim().toLowerCase(),
    phone: entry.phone?.trim() || undefined,
    city: entry.city?.trim() || undefined,
    vibe: entry.vibe || undefined,
    note: entry.note?.trim() || undefined,
    updatesOk: entry.updatesOk,
  };
  const idx = data.entries.findIndex((e) => e.email === next.email);
  if (idx >= 0) data.entries[idx] = { ...data.entries[idx], ...next, at };
  else data.entries.push(next);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
};

export function GurudevRegisterInterestSheet({ open, onOpenChange, event }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [vibe, setVibe] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [updatesOk, setUpdatesOk] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const pageUrl = getAbsoluteSiteUrl(`/events/${event.slug}`);

  const resetForOpen = useCallback(() => {
    const data = loadStored();
    const mine = data.entries[0];
    if (mine) {
      setName(mine.name);
      setEmail(mine.email);
      setPhone(mine.phone ?? '');
      setCity(mine.city ?? '');
      setVibe(mine.vibe ?? null);
      setNote(mine.note ?? '');
      setUpdatesOk(mine.updatesOk !== false);
      setSubmitted(true);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCity('');
      setVibe(null);
      setNote('');
      setUpdatesOk(true);
      setSubmitted(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) resetForOpen();
  }, [open, resetForOpen]);

  const addToCalendar = useCallback(() => {
    const ics = buildEventsIcs([event], event.title);
    downloadIcsFile('gurudev-birthday-2026.ics', ics);
    toast.success('Calendar file downloaded — open it to add the day');
  }, [event]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success('Event link copied');
    } catch {
      toast.error('Could not copy — copy from the address bar');
    }
  }, [pageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    const ph = phone.trim();
    const phoneDigits = ph.replace(/\D/g, '');
    if (n.length < 2) {
      toast.error('Please add your name');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      toast.error('Please add a valid email');
      return;
    }
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      toast.error('Please add a valid phone number (with country code if needed)');
      return;
    }
    setBusy(true);
    const localPayload = {
      name: n,
      email: em,
      phone: ph,
      city: city.trim() || undefined,
      vibe: vibe ?? undefined,
      note: note.trim() || undefined,
      updatesOk,
    };
    try {
      await submitEventInterest(event.slug, localPayload);
      saveEntry(localPayload);
      setSubmitted(true);
      toast.success('Thank you — the team has your details and may contact you.');
    } catch (err) {
      saveEntry(localPayload);
      setSubmitted(true);
      const msg = err instanceof Error ? err.message : '';
      const offline =
        /Cannot reach the API|bad gateway|unavailable|503|MongoDB/i.test(msg) || msg.includes('Failed to fetch');
      toast.warning(
        offline
          ? 'Saved on this device only — the server was unreachable. We will sync when you are online.'
          : `${msg || 'Could not reach the server.'} Your details are saved on this device.`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[min(92vh,780px)] overflow-y-auto rounded-t-[1.35rem] border-border/70 bg-gradient-to-b from-violet-950/[0.06] via-background to-background px-4 pb-8 pt-5 shadow-[0_-12px_60px_-20px_rgba(0,0,0,0.35)] dark:from-violet-400/[0.07] dark:border-white/10"
      >
        <SheetHeader className="space-y-2 pb-2 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Bell className="h-4 w-4" aria-hidden />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em]">Register interest</span>
          </div>
          <SheetTitle className="font-display text-xl font-light tracking-tight text-balance md:text-2xl">
            Raise your hand for this day
          </SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            No new tab — stay right here. Share how you would like to join, add your phone so we can reach you, lock the
            date in your calendar, and copy the link for your circle.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 dark:border-primary/25 dark:bg-primary/[0.06]">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <p>
              Your name, email, and phone are sent to our team when the app can reach the server. If you are offline, the
              same details are kept on <strong className="font-medium text-foreground">this device</strong> so nothing is
              lost.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              How are you leaning?
            </p>
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVibe((cur) => (cur === v.id ? null : v.id))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    vibe === v.id
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border/80 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="interest-name">Name</Label>
              <Input
                id="interest-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="interest-email">Email</Label>
              <Input
                id="interest-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-phone">Phone</Label>
            <Input
              id="interest-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              placeholder="With country code if needed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-city">City or time zone (optional)</Label>
            <Input
              id="interest-city"
              name="city"
              value={city}
              onChange={(ev) => setCity(ev.target.value)}
              placeholder="e.g. Bengaluru · GMT+5:30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-note">A few words (optional)</Label>
            <Textarea
              id="interest-note"
              name="note"
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              placeholder="What you’re hoping to experience — meditation, seva, satsang with sangha…"
              rows={3}
              className="resize-none"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm dark:border-white/10">
            <input
              type="checkbox"
              checked={updatesOk}
              onChange={(ev) => setUpdatesOk(ev.target.checked)}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <span className="leading-snug text-muted-foreground">
              I’m open to gentle reminders about this gathering <span className="text-foreground/80">on this site</span>{' '}
              when we add more detail.
            </span>
          </label>

          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-primary font-semibold shadow-md"
          >
            {submitted ? 'Update my details' : 'Save my interest'}
          </Button>

          {submitted && (
            <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Saved — you can edit anytime by opening this panel again.
            </p>
          )}
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
            <span className="bg-background px-3 text-muted-foreground">Anchor the day</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" className="h-11 rounded-xl gap-2" onClick={addToCalendar}>
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Add to calendar
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-xl gap-2" onClick={copyLink}>
            <Copy className="h-4 w-4" aria-hidden />
            Copy event link
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
