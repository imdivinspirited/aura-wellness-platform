/**
 * Site footer — utility-first “dock”, visit planner, links, newsletter, legal.
 * Preserves #aol-footer-* mount IDs and .aol-footer-* classes for legacy aol-enhancements.js
 */

import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Heart,
  MapPin,
  Phone,
  Mail,
  Send,
  Search,
  Calendar,
  HelpCircle,
  Navigation,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { SmartLink } from '@/components/ui/SmartLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChatbotStore } from '@/stores/chatbotStore';
import { LiveClockIcon } from '@/components/icons/LiveClockIcon';
import { useTranslation } from '@/lib/i18n';
import { AolicLogo } from '@/components/branding/AolicLogo';
import { OperatorChatGlyph } from '@/components/chatbot/OperatorIcon';

import { SearchModal } from '@/components/search/SearchModal';

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/artofliving',
  facebook: 'https://www.facebook.com/artofliving',
  youtube: 'https://www.youtube.com/artofliving',
  twitter: 'https://twitter.com/artofliving',
  linkedin: 'https://www.linkedin.com/company/artofliving',
} as const;

const ASHRAM_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Art+of+Living+International+Center+21st+KM+Kanakapura+Road+Bangalore';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const setChatOpen = useChatbotStore((s) => s.setOpen);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const quickDockActions = useMemo(
    () =>
      [
        {
          key: 'search',
          label: t('footer.actions.search.label'),
          sub: t('footer.actions.search.sub'),
          icon: Search,
          onClick: openSearch,
        },
        {
          key: 'guide',
          label: t('footer.actions.guide.label'),
          sub: t('footer.actions.guide.sub'),
          icon: OperatorChatGlyph,
          onClick: () => setChatOpen(true),
        },
        {
          key: 'call',
          label: t('footer.actions.call.label'),
          sub: t('footer.actions.call.sub'),
          icon: Phone,
          href: 'tel:+918067557777',
          external: false,
        },
        {
          key: 'maps',
          label: t('footer.actions.maps.label'),
          sub: t('footer.actions.maps.sub'),
          icon: Navigation,
          href: ASHRAM_MAPS_URL,
          external: true,
        },
        {
          key: 'events',
          label: t('footer.actions.events.label'),
          sub: t('footer.actions.events.sub'),
          icon: Calendar,
          to: '/events',
        },
        {
          key: 'faq',
          label: t('footer.actions.faq.label'),
          sub: t('footer.actions.faq.sub'),
          icon: HelpCircle,
          to: '/connect/faqs',
        },
      ],
    [t, openSearch, setChatOpen]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer
      id="aol-site-footer"
      className="aol-footer-enhanced relative overflow-hidden border-t border-border/60 lg:-mt-1"
      aria-label={t('footer.aria.site')}
    >
      {/* —— Action dock: tight to page content on desktop; mobile nav still clears via main pb-20 —— */}
      <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.10] dark:from-primary/[0.14] dark:via-[hsl(var(--foundation))] dark:to-secondary/[0.08]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]" aria-hidden>
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -12deg,
                transparent,
                transparent 24px,
                hsl(var(--primary) / 0.06) 24px,
                hsl(var(--primary) / 0.06) 25px
              )`,
            }}
          />
        </div>
        <div className="container relative px-3 pb-4 pt-5 sm:px-4 sm:pb-5 sm:pt-5 md:pb-6">
          <div className="mt-0 rounded-3xl border border-border/60 bg-background/55 p-3 shadow-[0_18px_55px_-42px_hsl(var(--foreground)/0.25)] backdrop-blur-lg sm:p-4 md:p-5">
            <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  {t('footer.quickActions.badge')}
                </p>
                <p className="mt-2 max-w-2xl text-pretty text-sm font-medium leading-snug text-foreground/90 sm:text-base">
                  {t('footer.quickActions.title')}
                </p>
                <p className="mt-1.5 max-w-2xl text-pretty text-xs leading-relaxed text-muted-foreground sm:text-[0.8125rem]">
                  {t('footer.quickActions.subtitle')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-h-[44px] shrink-0 gap-2 self-stretch rounded-full border-border/70 bg-background/80 px-4 text-sm backdrop-blur-sm hover:bg-background sm:self-auto"
                onClick={scrollToTop}
              >
                <ArrowUp className="h-4 w-4 shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{t('footer.backToTop')}</span>
              </Button>
            </div>

            <ul
              className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-3"
              role="list"
            >
              {quickDockActions.map((item) => {
                const Icon = item.icon;
                const cellClass = cn(
                  'group relative flex h-full min-h-[5.75rem] w-full min-w-0 items-center gap-2.5 rounded-2xl border border-border/70 bg-background/80 p-2.5 shadow-sm transition-all sm:min-h-[5.5rem] sm:gap-3 sm:p-3',
                  'hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                );
                const inner = (
                  <>
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/15 text-primary ring-1 ring-primary/20 sm:h-11 sm:w-11 sm:rounded-2xl">
                      <span
                        className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(120%_120%_at_20%_0%,rgba(255,255,255,0.35),transparent_55%)] opacity-70 dark:opacity-25 sm:rounded-2xl"
                        aria-hidden
                      />
                      <Icon
                        className={cn(
                          'relative sm:h-6 sm:w-6',
                          item.key === 'guide' ? 'h-4.5 w-4.5' : 'h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5'
                        )}
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden text-left">
                      <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground line-clamp-2 sm:text-sm">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 block break-words text-[0.6875rem] leading-snug text-muted-foreground line-clamp-2 sm:text-[0.75rem]',
                          item.key === 'call' && 'tabular-nums tracking-tight'
                        )}
                      >
                        {item.sub}
                      </span>
                    </span>
                  </>
                );
                if ('onClick' in item && item.onClick) {
                  return (
                    <li key={item.key} className="min-h-0 min-w-0">
                      <button type="button" onClick={item.onClick} className={cellClass}>
                        {inner}
                      </button>
                    </li>
                  );
                }
                if ('href' in item && item.href) {
                  return (
                    <li key={item.key} className="min-h-0 min-w-0">
                      <SmartLink
                        to={item.href}
                        openInNewTab={item.external === true}
                        className={cn(cellClass, 'no-underline')}
                      >
                        {inner}
                      </SmartLink>
                    </li>
                  );
                }
                if ('to' in item && item.to) {
                  return (
                    <li key={item.key} className="min-h-0 min-w-0">
                      <Link to={item.to} className={cn(cellClass, 'no-underline')}>
                        {inner}
                      </Link>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* —— Visit planner (distinct from generic columns) —— */}
      <div className="border-b border-white/10 bg-[hsl(var(--foundation))] text-white">
        <div className="container px-3 py-5 sm:px-4 sm:py-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-6">
            {/* Content (left) */}
            <div className="order-1 space-y-3 md:order-1 md:w-[42%] lg:w-[38%]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/90">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" aria-hidden />
                {t('footer.visit.badge')}
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {t('footer.visit.title')}
              </h2>
              <p className="max-w-prose text-sm leading-relaxed text-white/75">
                {t('footer.visit.description')}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
                  <LiveClockIcon className="h-4 w-4 text-[hsl(var(--primary))]" title={t('footer.visit.receptionHoursTitle')} />
                  {t('footer.visit.receptionLine')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110"
                >
                  <SmartLink to={ASHRAM_MAPS_URL} openInNewTab>
                    {t('footer.visit.openMaps')}
                  </SmartLink>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10">
                  <Link to="/connect/contact">{t('footer.visit.contactVisiting')}</Link>
                </Button>
              </div>
            </div>

            {/* Map (right) */}
            <div className="relative order-2 w-full overflow-hidden rounded-2xl ring-1 ring-white/15 md:order-2 md:w-[58%] lg:w-[62%]">
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/25" aria-hidden />
              <div className="absolute inset-0 flex items-center justify-center p-5 text-center">
                <div>
                  <MapPin className="mx-auto mb-2 h-7 w-7 text-[hsl(var(--primary))]" aria-hidden />
                  <p className="text-sm font-medium text-white/95">{t('footer.visit.mapLine1')}</p>
                  <p className="text-xs text-white/65">{t('footer.visit.mapLine2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* —— Brand + links (legacy class hooks) —— */}
      <div className="relative overflow-hidden bg-[hsl(var(--foundation))] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
          <svg className="h-full w-full text-white" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-mesh" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="0.4" />
                <path d="M40 12 L40 68 M12 40 L68 40" stroke="currentColor" strokeWidth="0.25" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-mesh)" />
          </svg>
        </div>

        <div className="container relative px-3 py-8 sm:px-4 md:py-12">
          <div className="aol-footer-main-grid mb-8 grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-4">
            <div className="aol-footer-column space-y-4">
              <div
                className="aol-footer-section-heading flex items-center gap-3"
                aria-labelledby="aol-footer-heading-brand"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
                  <AolicLogo
                    variant="onDark"
                    alt={t('footer.brand.logoAlt')}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <h3 id="aol-footer-heading-brand" className="font-display text-xl font-semibold text-white">
                    {t('footer.brand.title')}
                  </h3>
                  <p className="text-xs text-white/60">{t('footer.brand.tagline')}</p>
                </div>
              </div>
              <div id="aol-footer-panel-brand" className="aol-footer-panel space-y-4" aria-labelledby="aol-footer-heading-brand">
                <p className="text-sm italic text-[hsl(var(--primary))]">{t('footer.brand.taglineItalic')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { href: SOCIAL_LINKS.instagram, Icon: Instagram, label: 'Instagram' },
                    { href: SOCIAL_LINKS.facebook, Icon: Facebook, label: 'Facebook' },
                    { href: SOCIAL_LINKS.youtube, Icon: Youtube, label: 'YouTube' },
                    { href: SOCIAL_LINKS.twitter, Icon: Twitter, label: 'Twitter' },
                    { href: SOCIAL_LINKS.linkedin, Icon: Linkedin, label: 'LinkedIn' },
                  ].map(({ href, Icon, label }) => (
                    <SmartLink
                      key={label}
                      to={href}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/85 transition hover:scale-105 hover:bg-white/18 hover:text-[hsl(var(--primary))]"
                      aria-label={t('footer.brand.followOn').replace('{{label}}', label)}
                    >
                      <Icon className="h-5 w-5" />
                    </SmartLink>
                  ))}
                </div>
              </div>
            </div>

            <div className="aol-footer-column space-y-4">
              <h4
                id="aol-footer-heading-quicklinks"
                className="aol-footer-section-heading font-display text-sm font-semibold uppercase tracking-wider text-white/90"
              >
                {t('footer.columns.explore')}
              </h4>
              <div id="aol-footer-panel-quicklinks" className="aol-footer-panel" aria-labelledby="aol-footer-heading-quicklinks">
                <ul className="space-y-2.5">
                  {[
                    { to: '/explore/about', label: t('footer.exploreLinks.aboutAshram') },
                    { to: '/events', label: t('footer.exploreLinks.eventsCalendar') },
                    { to: '/seva-careers', label: t('footer.exploreLinks.sevaCareers') },
                    { to: '/explore/articles', label: t('footer.exploreLinks.articles') },
                    { to: '/services/shopping', label: t('footer.exploreLinks.shop') },
                  ].map(({ to, label }) => (
                    <li key={to}>
                      <Link to={to} className="text-sm text-white/70 transition hover:text-[hsl(var(--primary))]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="aol-footer-column space-y-4">
              <h4
                id="aol-footer-heading-programs"
                className="aol-footer-section-heading font-display text-sm font-semibold uppercase tracking-wider text-white/90"
              >
                {t('footer.columns.programs')}
              </h4>
              <div id="aol-footer-panel-programs" className="aol-footer-panel" aria-labelledby="aol-footer-heading-programs">
                <ul className="space-y-2.5">
                  {[
                    { to: '/programs/happiness-program', label: t('footer.programLinks.happiness') },
                    { to: '/programs/sri-sri-yoga', label: t('footer.programLinks.sriSriYoga') },
                    { to: '/programs/sahaj-samadhi', label: t('footer.programLinks.sahajSamadhi') },
                    { to: '/programs?category=children', label: t('footer.programLinks.childrenTeens') },
                  ].map(({ to, label }) => (
                    <li key={to}>
                      <Link to={to} className="text-sm text-white/70 transition hover:text-[hsl(var(--primary))]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="aol-footer-column space-y-4">
              <h4
                id="aol-footer-heading-connect"
                className="aol-footer-section-heading font-display text-sm font-semibold uppercase tracking-wider text-white/90"
              >
                {t('footer.columns.connect')}
              </h4>
              <div id="aol-footer-panel-connect" className="aol-footer-panel" aria-labelledby="aol-footer-heading-connect">
                <ul className="space-y-3 text-sm text-white/75">
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                    <a href="mailto:info@artofliving.org" className="hover:text-[hsl(var(--primary))]">
                      info@artofliving.org
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                    <a href="tel:+918067557777" className="hover:text-[hsl(var(--primary))]">
                      +91 80 6755 7777
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" aria-hidden />
                    <span>{t('footer.connect.address')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div id="aol-footer-trust-mount" />

          {/* Newsletter — clearer value exchange */}
          <div className="border-t border-white/10 py-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12">
              <div className="space-y-2">
                <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
                  {t('footer.newsletter.title')}
                </h4>
                <p className="text-sm text-white/70">
                  {t('footer.newsletter.description')}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-white/55">
                  <li className="flex gap-2">
                    <span className="text-[hsl(var(--primary))]" aria-hidden>
                      ✓
                    </span>
                    {t('footer.newsletter.bullet1')}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[hsl(var(--primary))]" aria-hidden>
                      ✓
                    </span>
                    {t('footer.newsletter.bullet2')}
                  </li>
                </ul>
              </div>
              <div>
                {subscribed ? (
                  <p className="text-sm text-white/85">{t('footer.newsletter.thankYou')}</p>
                ) : (
                  <form onSubmit={handleNewsletter} className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="email"
                      placeholder={t('footer.newsletter.placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'h-11 flex-1 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/45',
                        'focus-visible:border-white/35 focus-visible:ring-white/25'
                      )}
                      aria-label={t('footer.newsletter.emailAria')}
                    />
                    <Button
                      type="submit"
                      className="h-11 shrink-0 rounded-xl bg-[hsl(var(--primary))] px-6 text-[hsl(var(--primary-foreground))] hover:brightness-110"
                    >
                      <Send className="mr-2 h-4 w-4" aria-hidden />
                      {t('footer.newsletter.subscribe')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:flex-wrap">
            <p className="text-center text-sm text-white/50 md:text-left">
              {t('footer.bottom.copyright').replace('{{year}}', String(currentYear))}{' '}
              <span className="inline-flex items-center gap-1">
                {t('footer.bottom.madeWith')}{' '}
                <Heart className="inline h-3.5 w-3.5 fill-red-400 text-red-400" aria-hidden />{' '}
                {t('footer.bottom.forWorld')}
              </span>
            </p>
            <div id="aol-footer-lang-mount" className="flex w-full justify-center md:w-auto md:justify-end" />
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/55"
              aria-label={t('footer.aria.legal')}
            >
              <Link to="/privacy" className="min-h-[44px] hover:text-[hsl(var(--primary))]">
                {t('footer.bottom.privacy')}
              </Link>
              <Link to="/terms" className="min-h-[44px] hover:text-[hsl(var(--primary))]">
                {t('footer.bottom.terms')}
              </Link>
              <Link to="/connect/support" className="min-h-[44px] hover:text-[hsl(var(--primary))]">
                {t('footer.bottom.support')}
              </Link>
              <Link to="/sitemap" className="min-h-[44px] hover:text-[hsl(var(--primary))]">
                {t('footer.bottom.sitemap')}
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div id="aol-footer-chat-slot" />
    </footer>
  );
};
