import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSeoPageMeta } from '@/components/seo/SeoOverrideContext';
import { DEFAULT_SITE_DESCRIPTION } from '@/components/seo/routeSeoMap';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';

type Section = { sectionId: string; type: string; order: number; props: Record<string, any> };

interface CmsPageModel {
  slug: string;
  title: string;
  description?: string;
  language: string;
  sections: Section[];
}

async function fetchPage(slug: string) {
  return apiClient.get<{ success: boolean; data: { page: CmsPageModel } }>(`/content/pages/${encodeURIComponent(slug)}`);
}

function renderSection(section: Section) {
  const p = section.props || {};

  switch (section.type) {
    case 'hero':
      return (
        <section className="py-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border">
          <div className="container">
            <h1 className="font-display text-4xl md:text-5xl font-light mb-3">{p.heading || 'Untitled'}</h1>
            {p.subheading && <p className="text-muted-foreground text-lg max-w-2xl">{p.subheading}</p>}
            {p.ctaHref && p.ctaLabel && (
              <div className="mt-6">
                <Button asChild>
                  <a href={p.ctaHref}>{p.ctaLabel}</a>
                </Button>
              </div>
            )}
          </div>
        </section>
      );
    case 'rich_text':
      return (
        <section className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: String(p.html || '') }} />
        </section>
      );
    case 'image':
      return (
        <section>
          <img
            src={String(p.src || '')}
            alt={String(p.alt || '')}
            className="w-full rounded-2xl border object-cover"
            loading="lazy"
          />
        </section>
      );
    case 'cta':
      return (
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-2">{p.title || 'Call to action'}</h2>
          {p.text && <p className="text-muted-foreground mb-4">{p.text}</p>}
          {p.href && p.label && (
            <Button asChild>
              <a href={p.href}>{p.label}</a>
            </Button>
          )}
        </section>
      );
    case 'video_embed':
      return <YouTubeEmbed url={String(p.youtubeUrl || '')} />;
    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Unsupported section type: <code>{section.type}</code>
            </p>
          </CardContent>
        </Card>
      );
  }
}

export default function CmsPage() {
  const { slug } = useParams();
  const pageSlug = (slug || '').trim();

  const q = useQuery({
    queryKey: ['cms', 'page', pageSlug],
    queryFn: () => fetchPage(pageSlug),
    enabled: Boolean(pageSlug),
  });

  const page = q.data?.data?.page;
  const sections = (page?.sections || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  useSeoPageMeta(
    page
      ? {
          title: `${page.title} | The AOLIC Bangalore`,
          description: (page.description || DEFAULT_SITE_DESCRIPTION).slice(0, 160),
        }
      : null
  );

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl space-y-6">
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : q.isError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Page not found or not published.</p>
            </CardContent>
          </Card>
        ) : page ? (
          <>
            <div>
              <h1 className="font-display text-3xl font-light">{page.title}</h1>
              {page.description && <p className="text-muted-foreground">{page.description}</p>}
            </div>
            {sections.map((s) => (
              <div key={s.sectionId}>{renderSection(s)}</div>
            ))}
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}

