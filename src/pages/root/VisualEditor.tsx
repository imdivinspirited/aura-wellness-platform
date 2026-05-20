/**
 * Visual page builder — loads/saves canonical blocks `{ id, type, content }` via `/api/v1/editor/pages/:slug`.
 */
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEditor } from '@/hooks/useEditor';
import { createBlock, type CanvasBlock } from '@/lib/editor/blocks';
import {
  ArrowLeft,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Eye,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEFAULT_SLUG = 'home';

const LIBRARY: { type: string; label: string; icon: typeof Type }[] = [
  { type: 'hero', label: 'Hero', icon: LayoutGrid },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'cta', label: 'CTA', icon: Link2 },
  { type: 'section', label: 'Section', icon: LayoutGrid },
  { type: 'image', label: 'Image', icon: ImageIcon },
];

function BlockPreview({ block, preview }: { block: CanvasBlock; preview: boolean }) {
  const t = block.type.toLowerCase();
  const c = block.content;

  if (t === 'hero') {
    const headline = String(c.headline ?? 'Headline');
    const subhead = String(c.subhead ?? '');
    return (
      <div className="rounded-xl border bg-gradient-to-br from-primary/15 to-accent/10 p-8 text-center space-y-2">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Hero</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold">{headline}</h2>
        {subhead ? <p className="text-muted-foreground">{subhead}</p> : null}
      </div>
    );
  }

  if (t === 'text') {
    const html = String(c.html ?? '<p>Text</p>');
    return (
      <div className="rounded-lg border bg-card p-4 prose prose-sm dark:prose-invert max-w-none">
        <p className="text-xs font-mono text-muted-foreground mb-2">Text</p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  if (t === 'cta') {
    const label = String(c.label ?? 'Action');
    const href = String(c.href ?? '#');
    return (
      <div className="rounded-lg border bg-muted/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs font-mono text-muted-foreground">CTA</span>
        <Button asChild variant={preview ? 'default' : 'outline'}>
          <a href={href}>{label}</a>
        </Button>
      </div>
    );
  }

  if (t === 'section') {
    const title = String(c.title ?? 'Section');
    return (
      <div className="rounded-lg border-2 border-dashed border-primary/30 p-6">
        <p className="text-xs font-mono text-muted-foreground mb-2">Section</p>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
    );
  }

  if (t === 'image') {
    const src = String(c.src ?? '');
    const alt = String(c.alt ?? '');
    return (
      <div className="rounded-lg border overflow-hidden bg-muted/30">
        <p className="text-xs font-mono text-muted-foreground p-2 px-3">Image</p>
        {src ? (
          <img src={src} alt={alt} className="w-full h-48 object-cover" loading="lazy" />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No image URL</div>
        )}
      </div>
    );
  }

  return (
    <pre className="text-xs overflow-auto max-h-40 rounded-md border bg-muted/20 p-3">{JSON.stringify(block, null, 2)}</pre>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: CanvasBlock;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const t = block.type.toLowerCase();
  const c = block.content;

  if (t === 'hero') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Headline</Label>
          <Input
            value={String(c.headline ?? '')}
            onChange={(e) => onChange({ headline: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Subhead</Label>
          <Input
            value={String(c.subhead ?? '')}
            onChange={(e) => onChange({ subhead: e.target.value })}
            className="h-9"
          />
        </div>
      </div>
    );
  }

  if (t === 'text') {
    return (
      <div className="space-y-1 pt-2">
        <Label className="text-xs">HTML</Label>
        <textarea
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          value={String(c.html ?? '')}
          onChange={(e) => onChange({ html: e.target.value })}
        />
      </div>
    );
  }

  if (t === 'cta') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input value={String(c.label ?? '')} onChange={(e) => onChange({ label: e.target.value })} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL</Label>
          <Input value={String(c.href ?? '')} onChange={(e) => onChange({ href: e.target.value })} className="h-9" />
        </div>
      </div>
    );
  }

  if (t === 'section') {
    return (
      <div className="space-y-1 pt-2">
        <Label className="text-xs">Title</Label>
        <Input value={String(c.title ?? '')} onChange={(e) => onChange({ title: e.target.value })} className="h-9" />
      </div>
    );
  }

  if (t === 'image') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 pt-2">
        <div className="space-y-1">
          <Label className="text-xs">Image URL</Label>
          <Input value={String(c.src ?? '')} onChange={(e) => onChange({ src: e.target.value })} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Alt</Label>
          <Input value={String(c.alt ?? '')} onChange={(e) => onChange({ alt: e.target.value })} className="h-9" />
        </div>
      </div>
    );
  }

  return null;
}

function SortableRow({
  block,
  preview,
  onUpdate,
  onDelete,
}: {
  block: CanvasBlock;
  preview: boolean;
  onUpdate: (id: string, c: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border bg-card/40 shadow-sm',
        isDragging && 'z-50 opacity-90 ring-2 ring-primary/40'
      )}
    >
      {!preview && (
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-2 py-1.5 rounded-t-xl">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
              {block.type}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
            aria-label="Delete block"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="p-4 space-y-3">
        <BlockPreview block={block} preview={preview} />
        {!preview && (
          <BlockFields block={block} onChange={(patch) => onUpdate(block.id, patch)} />
        )}
      </div>
    </li>
  );
}

function VisualEditorCanvas() {
  const [slug] = useState(DEFAULT_SLUG);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState(false);
  const {
    page,
    blocks,
    loading,
    error,
    saving,
    lastSaved,
    save,
    updatePage,
    setBlocks,
    updateBlockContent,
    removeBlock,
  } = useEditor(slug);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addBlock = useCallback(
    (type: string) => {
      const b = createBlock(type);
      setBlocks((prev) => [...prev, b]);
    },
    [setBlocks]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    },
    [blocks, setBlocks]
  );

  const handleSave = useCallback(async () => {
    try {
      await save();
      toast.success('Page saved successfully');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error saving page';
      toast.error(msg);
    }
  }, [save]);

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] min-h-[480px]">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 bg-muted/30">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/root/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Root dashboard
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex gap-1">
            <Button
              type="button"
              variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('desktop')}
              aria-label="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('tablet')}
              aria-label="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('mobile')}
              aria-label="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant={previewMode ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setPreviewMode((v) => !v)}
          >
            {previewMode ? <PenLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            {lastSaved && <span className="hidden sm:inline">Last saved {lastSaved.toLocaleTimeString()}</span>}
            <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          <aside className="w-56 shrink-0 border-r bg-sidebar/50 p-3 hidden md:block">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Page</p>
            <p className="text-sm font-medium truncate">{slug}</p>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground mb-2">Blocks: {blocks.length}</p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Add block</p>
            <div className="flex flex-col gap-1.5">
              {LIBRARY.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-9 text-xs"
                  onClick={() => addBlock(type)}
                  disabled={loading || previewMode}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Button>
              ))}
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-w-0 bg-muted/20">
            {error && (
              <div className="m-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex-1 overflow-auto p-4 flex justify-center">
              <div
                className={cn(
                  'bg-background border shadow-sm rounded-lg transition-all duration-300 w-full',
                  viewport === 'desktop' && 'max-w-5xl',
                  viewport === 'tablet' && 'max-w-2xl',
                  viewport === 'mobile' && 'max-w-sm'
                )}
              >
                {loading ? (
                  <div className="p-12 text-center text-muted-foreground">Loading canvas…</div>
                ) : (
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="page-title">Title</Label>
                        <Input
                          id="page-title"
                          value={String(page?.title ?? '')}
                          onChange={(e) => updatePage({ title: e.target.value })}
                          className="mt-1"
                          disabled={previewMode}
                        />
                      </div>
                      <div>
                        <Label htmlFor="page-url">Page URL</Label>
                        <Input
                          id="page-url"
                          value={String(page?.pageUrl ?? '')}
                          onChange={(e) => updatePage({ pageUrl: e.target.value })}
                          className="mt-1"
                          disabled={previewMode}
                        />
                      </div>
                    </div>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-lg">Canvas</CardTitle>
                        <div className="flex flex-wrap gap-1 justify-end md:hidden">
                          {LIBRARY.slice(0, 3).map(({ type, label }) => (
                            <Button
                              key={type}
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => addBlock(type)}
                              disabled={previewMode}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {label}
                            </Button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {blocks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No blocks yet. Add blocks from the library, edit inline, drag to reorder, then{' '}
                            <strong>Save</strong> to persist to MongoDB.
                          </p>
                        ) : previewMode ? (
                          <ul className="space-y-4 list-none p-0 m-0">
                            {blocks.map((block) => (
                              <li key={block.id}>
                                <BlockPreview block={block} preview />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                              <ul className="space-y-4 list-none p-0 m-0">
                                {blocks.map((block) => (
                                  <SortableRow
                                    key={block.id}
                                    block={block}
                                    preview={false}
                                    onUpdate={(id, patch) => updateBlockContent(id, patch)}
                                    onDelete={removeBlock}
                                  />
                                ))}
                              </ul>
                            </SortableContext>
                          </DndContext>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="w-72 shrink-0 border-l bg-background p-3 hidden lg:block">
            <ScrollArea className="h-full pr-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Tips</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag the handle to reorder blocks. Edit fields under each block. Use Preview to hide chrome. Save pushes
                the full <code className="text-[10px]">blocks</code> array to the API.
              </p>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

export default function VisualEditor() {
  return <VisualEditorCanvas />;
}
