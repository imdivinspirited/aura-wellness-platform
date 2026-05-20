import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { rootListEventInterest } from '@/lib/api/eventInterest';

const VIBE_LABELS: Record<string, string> = {
  ashram: 'At the International Center',
  online: 'Online / from home',
  local: 'With local sangha',
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventInterestRootSheet({ open, onOpenChange }: Props) {
  const [eventSlugFilter, setEventSlugFilter] = React.useState('');
  const deferredSlug = React.useDeferredValue(eventSlugFilter.trim());

  const q = useQuery({
    queryKey: ['root', 'event-interest', deferredSlug],
    queryFn: () => rootListEventInterest(deferredSlug || undefined),
    enabled: open,
  });

  const rows = q.data?.data?.registrations ?? [];

  const copyPhones = React.useCallback(() => {
    const text = rows.map((r) => `${r.name}\t${r.phone}\t${r.email}`).join('\n');
    if (!text) {
      toast.message('No rows to copy');
      return;
    }
    void navigator.clipboard.writeText(text).then(
      () => toast.success('Copied name / phone / email'),
      () => toast.error('Could not copy')
    );
  }, [rows]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[min(100vw-2rem,56rem)] overflow-y-auto">
        <SheetHeader className="text-left space-y-1 pr-8">
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="h-4 w-4" aria-hidden />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]">Root</span>
          </div>
          <SheetTitle className="font-display text-xl">Event interest registrations</SheetTitle>
          <SheetDescription>
            Names, phone numbers, and notes from “Register interest” submissions. Filter by event slug or leave empty
            for all events (latest first, up to 500).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="interest-filter-slug">Event slug (optional)</Label>
            <Input
              id="interest-filter-slug"
              value={eventSlugFilter}
              onChange={(e) => setEventSlugFilter(e.target.value)}
              placeholder="e.g. gurudev-birthday-2026"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="gap-2" onClick={() => void q.refetch()} disabled={q.isFetching}>
              {q.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={copyPhones} disabled={!rows.length}>
              Copy contacts
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-md border">
          {q.isError && (
            <p className="p-4 text-sm text-destructive">
              {q.error instanceof Error ? q.error.message : 'Could not load registrations.'}
            </p>
          )}
          {q.isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          )}
          {!q.isLoading && !q.isError && rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No registrations yet for this filter.</p>
          )}
          {!q.isLoading && !q.isError && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Registered</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Vibe</TableHead>
                  <TableHead className="min-w-[140px]">Note</TableHead>
                  <TableHead className="text-center">Updates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground align-top">
                      {formatWhen(r.createdAt)}
                    </TableCell>
                    <TableCell className="align-top font-mono text-xs">{r.eventSlug}</TableCell>
                    <TableCell className="align-top">{r.name}</TableCell>
                    <TableCell className="align-top whitespace-nowrap">{r.phone}</TableCell>
                    <TableCell className="align-top text-xs break-all max-w-[10rem]">{r.email}</TableCell>
                    <TableCell className="align-top text-xs">{r.city ?? '—'}</TableCell>
                    <TableCell className="align-top text-xs">
                      {r.vibe ? VIBE_LABELS[r.vibe] ?? r.vibe : '—'}
                    </TableCell>
                    <TableCell className="align-top text-xs text-muted-foreground max-w-[200px]">
                      {r.note ?? '—'}
                    </TableCell>
                    <TableCell className="align-top text-center text-xs">{r.updatesOk ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
