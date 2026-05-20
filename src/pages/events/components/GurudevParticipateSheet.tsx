import * as React from 'react';
import {
  ArrowUpRight,
  BedDouble,
  Briefcase,
  BookOpen,
  HeartHandshake,
  Sparkles,
  Youtube,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SmartLink } from '@/components/ui/SmartLink';
import { ROUTES } from '@/lib/routes';
import { YOUTUBE_CHANNEL_URL } from '@/pages/events/config/eveningSatsang';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ActionRow = {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  openInNewTab?: boolean;
};

const ACTIONS: ActionRow[] = [
  {
    key: 'seva-careers',
    icon: <HeartHandshake className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />,
    title: 'Seva & careers at the ashram',
    description: 'Kitchen, hospitality, programmes desk, and long-term service — find a role that matches your skills.',
    href: ROUTES.SEVA_CAREERS,
  },
  {
    key: 'opportunities',
    icon: <Briefcase className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-500" aria-hidden />,
    title: 'Open opportunities',
    description: 'Explore roles across teams and projects — from on-ground seva to specialised openings.',
    href: ROUTES.OPPORTUNITIES,
  },
  {
    key: 'programs',
    icon: <BookOpen className="h-5 w-5 shrink-0 text-primary" aria-hidden />,
    title: 'Programmes at the ashram',
    description: 'Browse courses and retreats on this site — stay in one place while you explore.',
    href: ROUTES.PROGRAMS,
  },
  {
    key: 'youtube',
    icon: <Youtube className="h-5 w-5 shrink-0 text-red-600 dark:text-red-500" aria-hidden />,
    title: 'Follow the official channel',
    description: 'Watch live satsangs, replays, and schedule updates from the International Center.',
    href: YOUTUBE_CHANNEL_URL,
    openInNewTab: true,
  },
  {
    key: 'stay',
    icon: <BedDouble className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-500" aria-hidden />,
    title: 'Plan your visit',
    description: 'Stay, dining, and campus services — book ahead when you travel for the celebration.',
    href: ROUTES.SERVICES_STAY,
  },
];

export function GurudevParticipateSheet({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[min(92vh,760px)] overflow-y-auto rounded-t-[1.35rem] border-border/70 bg-gradient-to-b from-background to-muted/20 px-4 pb-8 pt-5 shadow-[0_-12px_60px_-20px_rgba(0,0,0,0.35)] dark:border-white/10 dark:to-[hsl(222_26%_7%)]"
      >
        <SheetHeader className="space-y-2 pb-2 text-left">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em]">Ways to take part</span>
          </div>
          <SheetTitle className="font-display text-xl font-light tracking-tight text-balance md:text-2xl">
            Choose how you want to participate
          </SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            The day is for everyone — on campus, in seva, in a course, or with the global sangha online. Pick a path that
            fits you; each link opens the right place on this site or our official channels.
          </SheetDescription>
        </SheetHeader>

        <ul className="mt-5 space-y-2.5 pb-1">
          {ACTIONS.map((action) => (
            <li key={action.key}>
              <SmartLink
                to={action.href}
                openInNewTab={Boolean(action.openInNewTab)}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'group flex w-full gap-3 rounded-2xl border border-border/70 bg-card/80 p-3.5 text-left shadow-sm transition-colors',
                  'hover:border-primary/35 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]'
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 dark:bg-white/[0.06]">
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-snug text-foreground group-hover:text-primary">{action.title}</span>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
                </div>
              </SmartLink>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
