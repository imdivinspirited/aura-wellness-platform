/**
 * Client-side SEO: title, description, canonical, OG/Twitter, JSON-LD (WebSite, Organization, optional LocalBusiness).
 * Per-page overrides via useSeoPageMeta() win over the route map.
 * Pages that still set document.title in useEffect run after first paint; prefer useSeoPageMeta for new work.
 */

import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSeoOverrideReader } from '@/components/seo/SeoOverrideContext';
import {
  DEFAULT_SITE_DESCRIPTION,
  resolveSeoForPath,
} from '@/components/seo/routeSeoMap';
import {
  getGa4MeasurementId,
  getGoogleSiteVerification,
  getGbpLocalBusiness,
} from '@/config/marketingEnv';

const SITE_ORIGIN =
  (import.meta.env.VITE_SITE_ORIGIN as string | undefined)?.replace(/\/$/, '') || 'https://artofliving.org';

function upsertMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkRel(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function GlobalSEO() {
  const { pathname } = useLocation();
  const ctx = useSeoOverrideReader();

  const { title, description } = useMemo(() => {
    if (ctx?.pageMeta?.title) {
      return {
        title: ctx.pageMeta.title,
        description: (ctx.pageMeta.description || DEFAULT_SITE_DESCRIPTION).slice(0, 160),
      };
    }
    return resolveSeoForPath(pathname);
  }, [pathname, ctx?.pageMeta?.title, ctx?.pageMeta?.description]);

  useEffect(() => {
    document.title = title;

    upsertMetaName('description', description.slice(0, 160));
    upsertMetaName('title', title);

    const pathOnly = pathname.split('?')[0] || '/';
    const canonicalHref = `${SITE_ORIGIN}${pathOnly === '/' ? '/' : pathOnly}`;
    upsertLinkRel('canonical', canonicalHref);

    const absOg = (p: string) => (p.startsWith('http') ? p : `${SITE_ORIGIN}${p.startsWith('/') ? '' : '/'}${p}`);

    upsertMetaProperty('og:type', 'website');
    upsertMetaProperty('og:url', canonicalHref);
    upsertMetaProperty('og:title', title);
    upsertMetaProperty('og:description', description.slice(0, 200));
    upsertMetaProperty('og:image', absOg('/og-image.jpg'));

    upsertMetaProperty('twitter:card', 'summary_large_image');
    upsertMetaProperty('twitter:url', canonicalHref);
    upsertMetaProperty('twitter:title', title);
    upsertMetaProperty('twitter:description', description.slice(0, 200));

    const gsc = getGoogleSiteVerification();
    if (gsc) {
      upsertMetaName('google-site-verification', gsc);
    }

    const gbp = getGbpLocalBusiness();
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN,
        name: 'The AOLIC Bangalore',
        description: DEFAULT_SITE_DESCRIPTION.slice(0, 200),
        inLanguage: 'en-IN',
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'The Art of Living International Center, Bangalore',
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/images/logos/aolic_logo.png`,
      },
    ];

    if (gbp) {
      const addr: Record<string, unknown> = {
        '@type': 'PostalAddress',
        addressLocality: gbp.addressLocality,
        addressRegion: gbp.addressRegion,
        addressCountry: gbp.addressCountry,
      };
      if (gbp.streetAddress) addr.streetAddress = gbp.streetAddress;
      if (gbp.postalCode) addr.postalCode = gbp.postalCode;

      const local: Record<string, unknown> = {
        '@type': 'LocalBusiness',
        '@id': `${SITE_ORIGIN}/#localbusiness`,
        name: gbp.name,
        url: SITE_ORIGIN,
        address: addr,
      };
      if (gbp.telephone) local.telephone = gbp.telephone;
      if (gbp.url) local.sameAs = [gbp.url];
      if (gbp.geo) {
        local.geo = {
          '@type': 'GeoCoordinates',
          latitude: gbp.geo.lat,
          longitude: gbp.geo.lng,
        };
      }
      graph.push(local);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    let script = document.getElementById('jsonld-global-site') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'jsonld-global-site';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    const ga = getGa4MeasurementId();
    if (ga) {
      upsertLinkRel('dns-prefetch', 'https://www.googletagmanager.com');
    }
  }, [pathname, title, description]);

  return null;
}
