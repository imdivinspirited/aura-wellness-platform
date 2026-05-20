import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { adminGetMedia, adminGetPage, adminUpdatePage } from '@/lib/api/admin';

type SectionType =
  | 'hero'
  | 'rich_text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'faq'
  | 'program_list'
  | 'event_list';

type Section = { sectionId: string; type: SectionType; order: number; props: Record<string, any> };

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

function normalizeOrders(sections: Section[]): Section[] {
  return sections
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, idx) => ({ ...s, order: idx + 1 }));
}

export default function PageEditorPage() {
  const { id } = useParams();
  const pageId = (id || '').trim();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const pageQ = useQuery({
    queryKey: ['admin', 'page', pageId],
    queryFn: () => adminGetPage(pageId) as Promise<any>,
    enabled: Boolean(pageId),
  });
  const mediaQ = useQuery({ queryKey: ['admin', 'media'], queryFn: adminGetMedia as any });

  const page = pageQ.data?.data?.page as any | undefined;
  const media = (mediaQ.data as any)?.data?.media as any[] | undefined;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Initialize local state once when page loads
  useMemo(() => {
    if (!page) return;
    setTitle((prev) => (prev ? prev : String(page.title || '')));
    setSlug((prev) => (prev ? prev : String(page.slug || '')));
    setDescription((prev) => (prev ? prev : String(page.description || '')));
    setLanguage((prev) => (prev !== 'en' ? prev : String(page.language || 'en')));
    setStatus((prev) => (prev !== 'draft' ? prev : (page.status === 'published' ? 'published' : 'draft')));
    setSections((prev) => (prev.length ? prev : normalizeOrders((page.sections || []) as Section[])));
    setSelectedSectionId((prev) => prev ?? ((page.sections?.[0]?.sectionId as string | undefined) ?? null));
  }, [page?._id]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.sectionId === selectedSectionId) || null,
    [sections, selectedSectionId]
  );

  const saveM = useMutation({
    mutationFn: async (payload: Partial<any>) => adminUpdatePage(pageId, payload) as Promise<any>,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'page', pageId] });
      await qc.invalidateQueries({ queryKey: ['admin', 'pages'] });
      toast({ title: 'Saved', description: 'Page updated in database.' });
    },
  });

  const handleAddSection = (type: SectionType) => {
    const next: Section = {
      sectionId: uid(type),
      type,
      order: sections.length + 1,
      props:
        type === 'hero'
          ? { heading: title || 'New Page', subheading: '', ctaLabel: '', ctaHref: '' }
          : type === 'cta'
            ? { title: 'Call to action', text: '', label: '', href: '' }
            : type === 'rich_text'
              ? { html: '<p>Your content…</p>' }
              : type === 'image'
                ? { src: '', alt: '' }
                : {},
    };
    const updated = normalizeOrders([...sections, next]);
    setSections(updated);
    setSelectedSectionId(next.sectionId);
  };

  const moveSection = (sectionId: string, dir: 'up' | 'down') => {
    const idx = sections.findIndex((s) => s.sectionId === sectionId);
    if (idx < 0) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const copy = sections.slice();
    const tmp = copy[idx];
    copy[idx] = copy[swapIdx];
    copy[swapIdx] = tmp;
    setSections(normalizeOrders(copy));
  };

  const removeSection = (sectionId: string) => {
    const updated = normalizeOrders(sections.filter((s) => s.sectionId !== sectionId));
    setSections(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.sectionId ?? null);
    }
  };

  const updateSectionProps = (sectionId: string, nextProps: Record<string, any>) => {
    setSections((prev) => prev.map((s) => (s.sectionId === sectionId ? { ...s, props: nextProps } : s)));
  };

  const save = (nextStatus?: 'draft' | 'published') => {
    const payload = {
      title,
      slug,
      description,
      language,
      status: nextStatus || status,
      sections: normalizeOrders(sections),
    };
    saveM.mutate(payload);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-light">Page builder</h1>
            <p className="text-sm text-muted-foreground">
              Elementor-style sections with instant publish. Public URL: <code>/p/{slug || '...'}</code>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => nav('/admin')}>
              Back
            </Button>
            <Button variant="outline" onClick={() => save('draft')} disabled={saveM.isPending}>
              Save draft
            </Button>
            <Button onClick={() => save('published')} disabled={saveM.isPending}>
              Publish
            </Button>
          </div>
        </div>

        {pageQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : pageQ.isError || !page ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Page not found or access denied.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Page settings</CardTitle>
                  <CardDescription>Title/slug/language and publish status.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Input value={status} onChange={(e) => setStatus(e.target.value as any)} placeholder="draft or published" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sections</CardTitle>
                  <CardDescription>Add, reorder, and edit sections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(['hero', 'rich_text', 'image', 'cta', 'faq', 'program_list', 'event_list'] as SectionType[]).map((t) => (
                      <Button key={t} size="sm" variant="outline" onClick={() => handleAddSection(t)}>
                        Add {t}
                      </Button>
                    ))}
                  </div>

                  {sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-3">No sections yet.</p>
                  ) : (
                    <ul className="space-y-2 mt-3">
                      {normalizeOrders(sections).map((s) => {
                        const isSel = s.sectionId === selectedSectionId;
                        return (
                          <li
                            key={s.sectionId}
                            className={`rounded-xl border p-3 ${isSel ? 'border-primary bg-primary/5' : 'bg-card'}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                className="text-left min-w-0 flex-1"
                                onClick={() => setSelectedSectionId(s.sectionId)}
                              >
                                <p className="text-sm font-medium truncate">
                                  {s.order}. {s.type}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">{s.sectionId}</p>
                              </button>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => moveSection(s.sectionId, 'up')}>
                                  ↑
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => moveSection(s.sectionId, 'down')}>
                                  ↓
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => removeSection(s.sectionId)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Section editor</CardTitle>
                  <CardDescription>Edit the selected section’s props.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedSection ? (
                    <p className="text-sm text-muted-foreground">Select a section to edit.</p>
                  ) : (
                    <Tabs defaultValue="form">
                      <TabsList>
                        <TabsTrigger value="form">Form</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value="form" className="mt-3 space-y-3">
                        {selectedSection.type === 'hero' && (
                          <>
                            <div className="space-y-1">
                              <Label>Heading</Label>
                              <Input
                                value={selectedSection.props.heading || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, heading: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Subheading</Label>
                              <Input
                                value={selectedSection.props.subheading || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, subheading: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label>CTA label</Label>
                                <Input
                                  value={selectedSection.props.ctaLabel || ''}
                                  onChange={(e) =>
                                    updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, ctaLabel: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>CTA href</Label>
                                <Input
                                  value={selectedSection.props.ctaHref || ''}
                                  onChange={(e) =>
                                    updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, ctaHref: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {selectedSection.type === 'image' && (
                          <>
                            <div className="space-y-1">
                              <Label>Image source (CDN URL)</Label>
                              <Input
                                value={selectedSection.props.src || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, src: e.target.value })
                                }
                                placeholder="https://cdn.example.com/images/..."
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Pick from media library</Label>
                              <select
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                value=""
                                onChange={(e) => {
                                  const url = e.target.value;
                                  if (!url) return;
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, src: url });
                                }}
                              >
                                <option value="">Select…</option>
                                {(media || [])
                                  .filter((m) => m.kind === 'image')
                                  .map((m) => (
                                    <option key={m._id} value={m.cdnUrl || ''}>
                                      {m.title || m.originalFileName || m._id}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label>Alt text</Label>
                              <Input
                                value={selectedSection.props.alt || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, alt: e.target.value })
                                }
                              />
                            </div>
                          </>
                        )}

                        {selectedSection.type === 'rich_text' && (
                          <div className="space-y-1">
                            <Label>HTML</Label>
                            <Textarea
                              value={selectedSection.props.html || ''}
                              onChange={(e) =>
                                updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, html: e.target.value })
                              }
                              rows={12}
                            />
                            <p className="text-xs text-muted-foreground">
                              This is rendered as HTML on the public page. Only trusted admins should edit this.
                            </p>
                          </div>
                        )}

                        {selectedSection.type === 'cta' && (
                          <>
                            <div className="space-y-1">
                              <Label>Title</Label>
                              <Input
                                value={selectedSection.props.title || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, title: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Text</Label>
                              <Input
                                value={selectedSection.props.text || ''}
                                onChange={(e) =>
                                  updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, text: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-1">
                                <Label>Button label</Label>
                                <Input
                                  value={selectedSection.props.label || ''}
                                  onChange={(e) =>
                                    updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, label: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Button href</Label>
                                <Input
                                  value={selectedSection.props.href || ''}
                                  onChange={(e) =>
                                    updateSectionProps(selectedSection.sectionId, { ...selectedSection.props, href: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {['faq', 'program_list', 'event_list', 'gallery'].includes(selectedSection.type) && (
                          <p className="text-sm text-muted-foreground">
                            Use the JSON tab for advanced section types for now. Next step will add structured editors for these too.
                          </p>
                        )}
                      </TabsContent>

                      <TabsContent value="json" className="mt-3 space-y-2">
                        <Textarea
                          value={JSON.stringify(selectedSection.props || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const next = JSON.parse(e.target.value);
                              updateSectionProps(selectedSection.sectionId, next);
                            } catch {
                              // ignore while typing
                            }
                          }}
                          rows={14}
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick actions</CardTitle>
                  <CardDescription>Save your work and verify public output.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => save()} disabled={saveM.isPending}>
                    Save (keep status)
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/p/${slug}`} target="_blank" rel="noreferrer">
                      Open public page
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

