import { getApiBaseUrl } from './client';
import { useRootAuthStore } from '@/stores/rootAuthStore';

function rootHeaders(): HeadersInit {
  const t = useRootAuthStore.getState().accessToken;
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

/** Parses Express / Zod error payloads into a single string for UI toasts. */
export function getEditorApiErrorMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== 'object') return fallback;
  const j = json as Record<string, unknown>;
  if (typeof j.message === 'string' && j.message.length > 0) return j.message;
  const err = j.error;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string' && e.message.length > 0) return e.message;
    if (e.message !== undefined && e.message !== null) {
      try {
        return typeof e.message === 'object' ? JSON.stringify(e.message) : String(e.message);
      } catch {
        return fallback;
      }
    }
  }
  return fallback;
}

export type EditorGetResponse = {
  success: boolean;
  data: {
    slug: string;
    blocks: unknown[];
    page: Record<string, unknown>;
  };
};

export type EditorSaveBody = {
  blocks?: unknown[];
  components?: unknown[];
  pageUrl?: string;
  title?: string;
  description?: string;
};

export type EditorPatchBody =
  | { operation: 'deleteBlock'; id: string }
  | { operation: 'updateBlock'; id: string; content?: Record<string, unknown>; type?: string }
  | { operation: 'reorder'; blockIds: string[] };

export async function editorGetPage(slug: string): Promise<EditorGetResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/editor/pages/${encodeURIComponent(slug)}`, {
    credentials: 'include',
    headers: rootHeaders(),
  });
  const json = (await res.json().catch(() => null)) as EditorGetResponse | null;
  if (!res.ok) {
    throw new Error(getEditorApiErrorMessage(json, 'Failed to load page'));
  }
  return json as EditorGetResponse;
}

export async function editorSavePage(slug: string, body: EditorSaveBody) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/editor/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: rootHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getEditorApiErrorMessage(json, `Save failed (${res.status})`));
  }
  return json as { success: boolean; data: EditorGetResponse['data'] };
}

export async function editorPatchPage(slug: string, body: EditorPatchBody) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/editor/pages/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: rootHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getEditorApiErrorMessage(json, `Update failed (${res.status})`));
  }
  return json as { success: boolean; data: EditorGetResponse['data'] };
}

export async function editorHistory(slug: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/editor/pages/${encodeURIComponent(slug)}/history`, {
    credentials: 'include',
    headers: rootHeaders(),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(getEditorApiErrorMessage(json, 'Failed to load history'));
  }
  return json as { success: boolean; data: { versions: unknown[] } };
}
