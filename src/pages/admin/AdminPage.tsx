import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateEvent,
  adminCreatePage,
  adminCreateProgram,
  adminCreateService,
  adminDeleteEvent,
  adminDeletePage,
  adminDeleteProgram,
  adminDeleteService,
  adminReindexSearch,
  adminSeedDemoData,
  adminGetEvents,
  adminGetMedia,
  adminGetPages,
  adminGetPrograms,
  adminGetServices,
  adminPresignMedia,
  adminFinalizeMedia,
  type AdminEventInput,
  type AdminPageInput,
  type AdminProgramInput,
  type AdminServiceInput,
} from '@/lib/api/admin';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

type ApiList<T> = { success: boolean; data: Record<string, T[]> };

function getList<T>(payload: unknown, key: string): T[] {
  const p = payload as ApiList<T> | undefined;
  const list = p?.data?.[key];
  return Array.isArray(list) ? list : [];
}

export default function AdminPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [programDraft, setProgramDraft] = useState<AdminProgramInput>({
    slug: '',
    title: '',
    shortDescription: '',
    description: '',
    category: 'beginning',
  });
  const [eventDraft, setEventDraft] = useState<AdminEventInput>({
    slug: '',
    title: '',
    shortDescription: '',
    description: '',
    schedule: { startAt: new Date().toISOString(), timezone: 'Asia/Kolkata' },
  });
  const [serviceDraft, setServiceDraft] = useState<AdminServiceInput>({
    slug: '',
    title: '',
    shortDescription: '',
    description: '',
    category: 'other',
  });
  const [pageDraft, setPageDraft] = useState<AdminPageInput>({
    slug: '',
    title: '',
    description: '',
    status: 'draft',
    language: 'en',
    sections: [
      {
        sectionId: 'hero',
        type: 'hero',
        order: 1,
        props: {
          heading: 'New Page',
          subheading: 'Edit this in admin',
          ctaLabel: 'Learn more',
          ctaHref: '/',
        },
      },
    ],
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');

  const seedM = useMutation({
    mutationFn: adminSeedDemoData,
    onSuccess: async (r: any) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin', 'programs'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'services'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
        qc.invalidateQueries({ queryKey: ['admin', 'media'] }),
      ]);
      toast({ title: 'Demo data seeded', description: `Indexed chunks: ${r?.data?.indexedChunks ?? '—'}` });
    },
    onError: (e) => {
      toast({ title: 'Seed failed', description: e instanceof Error ? e.message : 'Seed failed', variant: 'destructive' });
    },
  });

  const reindexM = useMutation({
    mutationFn: adminReindexSearch,
    onSuccess: async (r: any) => {
      toast({ title: 'Reindex complete', description: `Indexed chunks: ${r?.data?.indexedChunks ?? '—'}` });
    },
    onError: (e) => {
      toast({ title: 'Reindex failed', description: e instanceof Error ? e.message : 'Reindex failed', variant: 'destructive' });
    },
  });

  const programsQ = useQuery({ queryKey: ['admin', 'programs'], queryFn: adminGetPrograms });
  const eventsQ = useQuery({ queryKey: ['admin', 'events'], queryFn: adminGetEvents });
  const servicesQ = useQuery({ queryKey: ['admin', 'services'], queryFn: adminGetServices });
  const pagesQ = useQuery({ queryKey: ['admin', 'pages'], queryFn: adminGetPages });
  const mediaQ = useQuery({ queryKey: ['admin', 'media'], queryFn: adminGetMedia });

  const programs = useMemo(() => getList<any>(programsQ.data, 'programs'), [programsQ.data]);
  const events = useMemo(() => getList<any>(eventsQ.data, 'events'), [eventsQ.data]);
  const services = useMemo(() => getList<any>(servicesQ.data, 'services'), [servicesQ.data]);
  const pages = useMemo(() => getList<any>(pagesQ.data, 'pages'), [pagesQ.data]);
  const media = useMemo(() => getList<any>(mediaQ.data, 'media'), [mediaQ.data]);

  const createProgramM = useMutation({
    mutationFn: adminCreateProgram,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'programs'] });
      setProgramDraft({ slug: '', title: '', shortDescription: '', description: '', category: 'beginning' });
    },
  });
  const deleteProgramM = useMutation({
    mutationFn: adminDeleteProgram,
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['admin', 'programs'] }),
  });

  const createEventM = useMutation({
    mutationFn: adminCreateEvent,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      setEventDraft({
        slug: '',
        title: '',
        shortDescription: '',
        description: '',
        schedule: { startAt: new Date().toISOString(), timezone: 'Asia/Kolkata' },
      });
    },
  });
  const deleteEventM = useMutation({
    mutationFn: adminDeleteEvent,
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });

  const createServiceM = useMutation({
    mutationFn: adminCreateService,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'services'] });
      setServiceDraft({ slug: '', title: '', shortDescription: '', description: '', category: 'other' });
    },
  });
  const deleteServiceM = useMutation({
    mutationFn: adminDeleteService,
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['admin', 'services'] }),
  });

  const createPageM = useMutation({
    mutationFn: adminCreatePage,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'pages'] });
      toast({ title: 'Page created', description: 'Saved to database. Publish it when ready.' });
      setPageDraft({
        slug: '',
        title: '',
        description: '',
        status: 'draft',
        language: 'en',
        sections: [
          {
            sectionId: 'hero',
            type: 'hero',
            order: 1,
            props: { heading: 'New Page', subheading: 'Edit this in admin', ctaLabel: 'Learn more', ctaHref: '/' },
          },
        ],
      });
    },
  });
  const deletePageM = useMutation({
    mutationFn: adminDeletePage,
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['admin', 'pages'] }),
  });

  const uploadMediaM = useMutation({
    mutationFn: async (file: File) => {
      const presign = (await adminPresignMedia({
        kind: file.type.startsWith('image/') ? 'image' : 'document',
        contentType: file.type,
        fileName: file.name,
        sizeBytes: file.size,
      })) as any;

      const uploadUrl = presign?.data?.uploadUrl as string | undefined;
      const assetId = presign?.data?.assetId as string | undefined;
      if (!uploadUrl || !assetId) throw new Error('Presign failed');

      const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!put.ok) throw new Error('Upload failed');

      await adminFinalizeMedia({ assetId, alt: mediaAlt || undefined, title: mediaTitle || undefined });
      return assetId;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'media'] });
      toast({ title: 'Upload complete', description: 'Media saved and ready to use.' });
      setMediaFile(null);
      setMediaAlt('');
      setMediaTitle('');
    },
  });

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-light">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            Manage programs, events, and services. Changes are stored in the database and appear immediately wherever the app reads these APIs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Tools</CardTitle>
            <CardDescription>Bootstrap real data and keep the chatbot index up to date.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => seedM.mutate()} disabled={seedM.isPending}>
              {seedM.isPending ? 'Seeding…' : 'Seed demo data'}
            </Button>
            <Button variant="outline" onClick={() => reindexM.mutate()} disabled={reindexM.isPending}>
              {reindexM.isPending ? 'Reindexing…' : 'Reindex chatbot'}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="programs">
          <TabsList>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create program</CardTitle>
                <CardDescription>Creates a new program record (database-backed).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={programDraft.slug} onChange={(e) => setProgramDraft({ ...programDraft, slug: e.target.value })} placeholder="happiness-program" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Input value={programDraft.category} onChange={(e) => setProgramDraft({ ...programDraft, category: e.target.value as any })} placeholder="beginning" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Title</Label>
                    <Input value={programDraft.title} onChange={(e) => setProgramDraft({ ...programDraft, title: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Short description</Label>
                    <Input value={programDraft.shortDescription} onChange={(e) => setProgramDraft({ ...programDraft, shortDescription: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={programDraft.description} onChange={(e) => setProgramDraft({ ...programDraft, description: e.target.value })} rows={5} />
                  </div>
                </div>
                <Button onClick={() => createProgramM.mutate(programDraft)} disabled={createProgramM.isPending}>
                  {createProgramM.isPending ? 'Creating…' : 'Create program'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programs</CardTitle>
                <CardDescription>Current database records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {programsQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : programs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No programs yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {programs.map((p: any) => (
                      <li key={p._id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/{p.slug} · {p.category}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteProgramM.mutate(p._id)} disabled={deleteProgramM.isPending}>
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create event</CardTitle>
                <CardDescription>Creates a new event record (database-backed).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={eventDraft.slug} onChange={(e) => setEventDraft({ ...eventDraft, slug: e.target.value })} placeholder="samyam-2026" />
                  </div>
                  <div className="space-y-1">
                    <Label>Start (ISO)</Label>
                    <Input value={eventDraft.schedule.startAt} onChange={(e) => setEventDraft({ ...eventDraft, schedule: { ...eventDraft.schedule, startAt: e.target.value } })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Title</Label>
                    <Input value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Short description</Label>
                    <Input value={eventDraft.shortDescription} onChange={(e) => setEventDraft({ ...eventDraft, shortDescription: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={eventDraft.description} onChange={(e) => setEventDraft({ ...eventDraft, description: e.target.value })} rows={5} />
                  </div>
                </div>
                <Button onClick={() => createEventM.mutate(eventDraft)} disabled={createEventM.isPending}>
                  {createEventM.isPending ? 'Creating…' : 'Create event'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>Current database records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {eventsQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {events.map((ev: any) => (
                      <li key={ev._id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ev.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/{ev.slug} · {ev?.schedule?.startAt ? new Date(ev.schedule.startAt).toLocaleString() : '—'}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteEventM.mutate(ev._id)} disabled={deleteEventM.isPending}>
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create service</CardTitle>
                <CardDescription>Creates a new service record (database-backed).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={serviceDraft.slug} onChange={(e) => setServiceDraft({ ...serviceDraft, slug: e.target.value })} placeholder="dining" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Input value={serviceDraft.category} onChange={(e) => setServiceDraft({ ...serviceDraft, category: e.target.value as any })} placeholder="dining" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Title</Label>
                    <Input value={serviceDraft.title} onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Short description</Label>
                    <Input value={serviceDraft.shortDescription} onChange={(e) => setServiceDraft({ ...serviceDraft, shortDescription: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={serviceDraft.description} onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })} rows={5} />
                  </div>
                </div>
                <Button onClick={() => createServiceM.mutate(serviceDraft)} disabled={createServiceM.isPending}>
                  {createServiceM.isPending ? 'Creating…' : 'Create service'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Current database records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {servicesQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : services.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No services yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {services.map((s: any) => (
                      <li key={s._id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.title}</p>
                          <p className="text-xs text-muted-foreground truncate">/{s.slug} · {s.category}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteServiceM.mutate(s._id)} disabled={deleteServiceM.isPending}>
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create CMS page</CardTitle>
                <CardDescription>
                  Creates a database-backed page. Once published, it can be rendered publicly at <code>/p/&lt;slug&gt;</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Slug</Label>
                    <Input value={pageDraft.slug} onChange={(e) => setPageDraft({ ...pageDraft, slug: e.target.value })} placeholder="international-visitors" />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Input value={pageDraft.status || 'draft'} onChange={(e) => setPageDraft({ ...pageDraft, status: e.target.value as any })} placeholder="draft or published" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Title</Label>
                    <Input value={pageDraft.title} onChange={(e) => setPageDraft({ ...pageDraft, title: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Description</Label>
                    <Input value={pageDraft.description || ''} onChange={(e) => setPageDraft({ ...pageDraft, description: e.target.value })} />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Sections (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(pageDraft.sections ?? [], null, 2)}
                      onChange={(e) => {
                        try {
                          const sections = JSON.parse(e.target.value);
                          setPageDraft({ ...pageDraft, sections });
                        } catch {
                          // keep typing
                        }
                      }}
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Advanced editor. Next step will add a drag/drop builder UI.
                    </p>
                  </div>
                </div>
                <Button onClick={() => createPageM.mutate(pageDraft)} disabled={createPageM.isPending}>
                  {createPageM.isPending ? 'Creating…' : 'Create page'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pages</CardTitle>
                <CardDescription>Database-backed CMS pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {pagesQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : pages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pages yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {pages.map((p: any) => (
                      <li key={p._id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            /p/{p.slug} · {p.status} · {p.language}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/pages/${p._id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePageM.mutate(p._id)}
                            disabled={deletePageM.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload media (S3 via presigned URL)</CardTitle>
                <CardDescription>
                  Select a file to upload. The browser uploads directly to S3 using a short-lived presigned URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input type="file" onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Title (optional)</Label>
                    <Input value={mediaTitle} onChange={(e) => setMediaTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Alt text (optional)</Label>
                    <Input value={mediaAlt} onChange={(e) => setMediaAlt(e.target.value)} />
                  </div>
                </div>
                <Button
                  onClick={() => mediaFile && uploadMediaM.mutate(mediaFile)}
                  disabled={!mediaFile || uploadMediaM.isPending}
                >
                  {uploadMediaM.isPending ? 'Uploading…' : 'Upload'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Requires backend env vars: <code>AWS_REGION</code>, <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_S3_BUCKET</code>. Optional: <code>CLOUDFRONT_MEDIA_BASE_URL</code>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media library</CardTitle>
                <CardDescription>Recently uploaded assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {mediaQ.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : media.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No media yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {media.map((m: any) => (
                      <li key={m._id} className="rounded-xl border bg-card p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{m.title || m.originalFileName || 'Media'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {m.kind} · {m.contentType || '—'} · {m.cdnUrl || m.s3Key || '—'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

