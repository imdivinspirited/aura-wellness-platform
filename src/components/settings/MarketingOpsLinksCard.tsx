/**
 * In-app pointers to SEO / analytics / security processes (GSC, GA4, GBP, backlinks, pen-test).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, LineChart, Radar, Shield } from 'lucide-react';

const SITE_ORIGIN =
  (import.meta.env.VITE_SITE_ORIGIN as string | undefined)?.replace(/\/$/, '') || 'https://artofliving.org';

const links = [
  {
    label: 'Google Search Console',
    href: 'https://search.google.com/search-console',
    hint: 'Indexing, coverage, Core Web Vitals field data, manual actions.',
  },
  {
    label: 'Google Analytics (GA4)',
    hint: 'Set VITE_GA4_MEASUREMENT_ID; this app sends SPA page views + Web Vitals when consent allows.',
    href: 'https://analytics.google.com/',
  },
  {
    label: 'Google Business Profile',
    href: 'https://business.google.com/',
    hint: 'Local pack, reviews, hours — complement with VITE_GBP_* JSON-LD when configured.',
  },
  {
    label: 'Rich results test',
    href: 'https://search.google.com/test/rich-results',
    hint: 'Validate Organization / LocalBusiness JSON-LD.',
  },
] as const;

export function MarketingOpsLinksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Marketing, SEO & security ops
        </CardTitle>
        <CardDescription>
          Tools and processes live outside this repo (hosting / CDN / Google). Use env vars for verification tags and
          analytics IDs. Canonical site:{' '}
          <a className="underline underline-offset-2" href={SITE_ORIGIN}>
            {SITE_ORIGIN.replace(/^https?:\/\//, '')}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ul className="space-y-3">
          {links.map((item) => (
            <li key={item.label} className="flex flex-col gap-0.5 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
              >
                {item.label}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
              <span className="text-muted-foreground text-xs">{item.hint}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Radar className="h-4 w-4" /> Rank & backlinks
          </p>
          <p className="text-muted-foreground text-xs">
            Track queries and positions in Search Console; use Ahrefs / Semrush / Moz for backlink audits. This app
            exposes <code className="text-xs bg-background px-1 rounded">/sitemap.xml</code> and{' '}
            <code className="text-xs bg-background px-1 rounded">/robots.txt</code> for crawlers.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" /> WAF, DDoS, pen-test
          </p>
          <p className="text-muted-foreground text-xs">
            Configure WAF and bot protection at your CDN or load balancer. The API uses Helmet, rate limits, and (in
            production) HSTS. Publish <code className="text-xs bg-background px-1 rounded">/.well-known/security.txt</code>{' '}
            with a real security contact. Schedule third-party penetration tests on staging before major releases.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
