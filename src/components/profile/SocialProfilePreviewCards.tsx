import type { ReactNode, ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Globe, Instagram, Linkedin } from 'lucide-react';
import { getInstagramAvatarImgUrl, getLinkedinAvatarImgUrlFromRaw } from '@/lib/api/preview';
import {
  extractInstagramUsername,
  instagramDisplayLabel,
  instagramProfileHref,
  linkedinDisplayLabel,
  linkedinProfileHref,
  websiteDisplayHost,
  websiteFaviconUrl,
  websiteProfileHref,
} from '@/lib/socialLinks';
import { cn } from '@/lib/utils';

function PreviewAvatar({
  src,
  alt,
  fallback,
  boxClassName = 'h-14 w-14',
  iconWrapClassName = 'opacity-40',
}: {
  src: string | null;
  alt: string;
  fallback: ReactNode;
  boxClassName?: string;
  iconWrapClassName?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground',
          boxClassName,
        )}
      >
        {fallback}
      </div>
    );
  }
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full border bg-muted', boxClassName)}>
      <div className={cn('absolute inset-0 flex items-center justify-center', iconWrapClassName)}>{fallback}</div>
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        loading="lazy"
        className="relative z-10 h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.classList.add('hidden');
        }}
      />
    </div>
  );
}

/**
 * Loads proxied profile photo via fetch→blob (avoids <img> quirks + works for both IG and LinkedIn same-origin APIs).
 */
function ProxiedAvatarFetch({
  requestUrl,
  pulseClassName,
  boxClassName = 'h-14 w-14',
  iconWrapClassName = 'opacity-40',
  icon,
}: {
  requestUrl: string | null;
  pulseClassName: string;
  boxClassName?: string;
  iconWrapClassName?: string;
  icon: ReactNode;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    setFailed(false);
    setBlobUrl(null);
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
    if (!requestUrl) return;

    let cancelled = false;
    setPending(true);
    (async () => {
      try {
        const res = await fetch(requestUrl, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        if (cancelled) return;
        if (blob.size < 32) throw new Error('empty');
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setBlobUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setPending(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [requestUrl]);

  if (!requestUrl || failed) {
    return (
      <PreviewAvatar src={null} alt="" fallback={icon} boxClassName={boxClassName} iconWrapClassName={iconWrapClassName} />
    );
  }

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full border bg-muted', boxClassName)}>
      {pending && !blobUrl ? (
        <div className={cn('absolute inset-0 animate-pulse rounded-full', pulseClassName)} aria-hidden />
      ) : null}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
          iconWrapClassName,
          blobUrl && 'opacity-0',
        )}
      >
        {icon}
      </div>
      {blobUrl ? (
        <img src={blobUrl} alt="" className="relative z-10 h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function InstagramProfileAvatar({
  raw,
  boxClassName = 'h-14 w-14',
  iconWrapClassName = 'opacity-40',
  icon,
}: {
  raw: string;
  boxClassName?: string;
  iconWrapClassName?: string;
  icon: ReactNode;
}) {
  const username = extractInstagramUsername(raw);
  const requestUrl = useMemo(() => (username ? getInstagramAvatarImgUrl(username) : null), [username]);
  return (
    <ProxiedAvatarFetch
      requestUrl={requestUrl}
      pulseClassName="bg-gradient-to-br from-orange-500/25 via-pink-500/20 to-purple-600/25"
      boxClassName={boxClassName}
      iconWrapClassName={iconWrapClassName}
      icon={icon}
    />
  );
}

function LinkedInProfileAvatar({
  raw,
  boxClassName = 'h-14 w-14',
  iconWrapClassName = 'opacity-40',
  icon,
}: {
  raw: string;
  boxClassName?: string;
  iconWrapClassName?: string;
  icon: ReactNode;
}) {
  const requestUrl = useMemo(() => getLinkedinAvatarImgUrlFromRaw(raw), [raw]);
  return (
    <ProxiedAvatarFetch
      requestUrl={requestUrl}
      pulseClassName="bg-[#0A66C2]/15"
      boxClassName={boxClassName}
      iconWrapClassName={iconWrapClassName}
      icon={icon}
    />
  );
}

function LinkCard({
  href,
  title,
  subtitle,
  avatar,
  accentClassName,
}: {
  href: string;
  title: string;
  subtitle: string;
  avatar: ReactNode;
  accentClassName?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex gap-3 rounded-xl border border-border/80 bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40',
        accentClassName,
      )}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
          Open profile
          <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
        </span>
      </div>
    </a>
  );
}

export type SocialProfilePreviewCardsProps = {
  instagram?: string;
  linkedin?: string;
  website?: string;
  className?: string;
};

/**
 * Rich “account” cards: avatar/favicon + handle, linking to the public profile.
 */
export function SocialProfilePreviewCards({ instagram, linkedin, website, className }: SocialProfilePreviewCardsProps) {
  const items: ReactElement[] = [];

  if (instagram?.trim()) {
    const href = instagramProfileHref(instagram);
    if (href) {
      const igIcon = <Instagram className="h-7 w-7 text-pink-600 dark:text-pink-400" aria-hidden />;
      items.push(
        <LinkCard
          key="ig"
          href={href}
          title={instagramDisplayLabel(instagram)}
          subtitle="Instagram"
          accentClassName="hover:from-orange-500/5 hover:to-purple-600/5"
          avatar={<InstagramProfileAvatar raw={instagram} icon={igIcon} />}
        />,
      );
    }
  }

  if (linkedin?.trim()) {
    const href = linkedinProfileHref(linkedin);
    if (href) {
      const liIcon = <Linkedin className="h-7 w-7 text-[#0A66C2]" aria-hidden />;
      items.push(
        <LinkCard
          key="li"
          href={href}
          title={linkedinDisplayLabel(linkedin)}
          subtitle="LinkedIn"
          avatar={<LinkedInProfileAvatar raw={linkedin} icon={liIcon} />}
        />,
      );
    }
  }

  if (website?.trim()) {
    const href = websiteProfileHref(website);
    if (href) {
      items.push(
        <LinkCard
          key="web"
          href={href}
          title={websiteDisplayHost(website)}
          subtitle="Website"
          avatar={
            <PreviewAvatar
              src={websiteFaviconUrl(website)}
              alt=""
              fallback={<Globe className="h-7 w-7 text-primary" aria-hidden />}
            />
          }
        />,
      );
    }
  }

  if (items.length === 0) return null;

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items}
    </div>
  );
}

export type SocialLinkPeekProps = {
  platform: 'instagram' | 'linkedin' | 'website';
  raw: string;
  className?: string;
};

/** Compact preview under form fields while editing. */
export function SocialLinkPeek({ platform, raw, className }: SocialLinkPeekProps) {
  const t = raw.trim();
  if (!t) return null;

  let href = '';
  let title = '';
  let subtitle = '';

  if (platform === 'instagram') {
    href = instagramProfileHref(t);
    title = instagramDisplayLabel(t);
    subtitle = 'Instagram preview';
  } else if (platform === 'linkedin') {
    href = linkedinProfileHref(t);
    title = linkedinDisplayLabel(t);
    subtitle = 'LinkedIn preview';
  } else {
    href = websiteProfileHref(t);
    title = websiteDisplayHost(t);
    subtitle = 'Website preview';
  }

  if (!href) return null;

  const icon =
    platform === 'instagram' ? (
      <Instagram className="h-6 w-6 text-pink-600 dark:text-pink-400" aria-hidden />
    ) : platform === 'linkedin' ? (
      <Linkedin className="h-6 w-6 text-[#0A66C2]" aria-hidden />
    ) : (
      <Globe className="h-6 w-6 text-primary" aria-hidden />
    );

  const avatar =
    platform === 'instagram' ? (
      <InstagramProfileAvatar raw={t} boxClassName="h-10 w-10" iconWrapClassName="opacity-35" icon={icon} />
    ) : platform === 'linkedin' ? (
      <LinkedInProfileAvatar raw={t} boxClassName="h-10 w-10" iconWrapClassName="opacity-35" icon={icon} />
    ) : (
      <PreviewAvatar
        src={websiteFaviconUrl(t)}
        alt=""
        fallback={icon}
        boxClassName="h-10 w-10"
        iconWrapClassName="opacity-35"
      />
    );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'mt-2 flex items-center gap-3 rounded-lg border border-dashed border-border/90 bg-muted/30 px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-muted/50',
        className,
      )}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle} · tap to open</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </a>
  );
}
