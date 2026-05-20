import { AolicLogo } from '@/components/branding/AolicLogo';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';

const HERO_WEBP = '/images/hero/hero_landing_ashram.webp';
const HERO_JPG = '/images/hero/hero_landing_ashram.jpg';

export type AuthSplitLayoutProps = {
  children: ReactNode;
  /** Large title on the image side */
  headline: string;
  description: string;
  footline: string;
};

/**
 * Full-viewport auth shell: ~50% hero imagery, ~50% form (no extra framed box).
 * Works in light and dark mode (image has gradient scrim).
 */
export function AuthSplitLayout({ children, headline, description, footline }: AuthSplitLayoutProps) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <MainLayout hideFooter contentClassName="!p-0 !pb-0 overflow-hidden">
      {/*
        Lock height to viewport minus header + mobile bottom dock (pb-20 area). No document scroll.
        lg+: bottom dock hidden — only subtract header.
      */}
      <div
        className={cn(
          'relative grid w-full shrink-0 grid-cols-1 overflow-hidden sm:grid-cols-2 sm:gap-0',
          /* Header (~3.5rem sm:4rem) + mobile bottom dock (~5rem). Desktop: header only. */
          'h-[calc(100svh-3.5rem-5rem)] sm:h-[calc(100svh-4rem-5rem)] lg:h-[calc(100svh-4rem)]'
        )}
      >
        {/* Hero / brand column — left on sm+ */}
        <aside
          className={cn(
            'relative flex min-h-[min(36vh,260px)] flex-col justify-between overflow-hidden sm:min-h-0'
          )}
        >
          <picture className="absolute inset-0">
            <source type="image/webp" srcSet={HERO_WEBP} />
            <img
              src={HERO_JPG}
              alt=""
              className="h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          </picture>
          {/* Scrim: readable in light + dark */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              'from-background/88 via-background/55 to-primary/25',
              'dark:from-background/92 dark:via-background/70 dark:to-primary/35'
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 opacity-40 dark:opacity-55',
              'bg-[radial-gradient(ellipse_90%_80%_at_20%_20%,hsl(var(--primary)/0.35),transparent_55%)]'
            )}
          />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden p-5 sm:p-6 lg:p-8">
            <div className="min-w-0">
              <Link to="/" className="inline-block rounded-lg outline-offset-4 transition-opacity hover:opacity-90">
                <AolicLogo alt="Art of Living" className="h-9 w-auto sm:h-10" />
              </Link>
              <h1 className="mt-4 max-w-md font-display text-xl font-semibold tracking-tight text-foreground sm:mt-5 sm:text-2xl lg:text-3xl">
                {headline}
              </h1>
              <p className="mt-2 max-w-md text-xs leading-snug text-muted-foreground sm:text-sm">{description}</p>
            </div>
            <p className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/90 sm:text-xs">
              {footline}
            </p>
          </div>
        </aside>

        {/* Form column — right on sm+ */}
        <div
          className={cn(
            'relative flex min-h-0 flex-col justify-center overflow-hidden px-3 py-2 sm:px-5 sm:py-3 lg:px-8 xl:px-10',
            'bg-gradient-to-b from-muted/30 via-background to-background',
            'dark:from-muted/20 dark:via-background dark:to-background'
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/10" />
            <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-secondary/[0.08] blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[420px] flex-1 flex-col justify-center overflow-y-auto overscroll-contain py-0">
            {children}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
