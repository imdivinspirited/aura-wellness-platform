/**
 * Normalize user-entered social URLs and build preview assets (avatars / favicons).
 */

export function linkedinProfileHref(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, '')}`;
}

export function instagramProfileHref(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('@')) return `https://instagram.com/${encodeURIComponent(s.slice(1))}`;
  if (s.includes('instagram.com')) return `https://${s.replace(/^https?:\/\//i, '')}`;
  return `https://instagram.com/${encodeURIComponent(s.replace(/^@/, ''))}`;
}

export function websiteProfileHref(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s.replace(/^\/+/, '')}`;
}

/** Instagram handle for display and unavatar (no @). */
export function extractInstagramUsername(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    if (/instagram\.com/i.test(s)) {
      const url = new URL(s.startsWith('http') ? s : `https://${s.replace(/^\/\//, '')}`);
      const seg = url.pathname.split('/').filter(Boolean)[0];
      if (
        seg &&
        !['p', 'reel', 'reels', 'explore', 'stories', 'tv', 'accounts'].includes(seg.toLowerCase())
      ) {
        return seg.split('?')[0];
      }
    }
  } catch {
    /* ignore */
  }
  const cleaned = s
    .replace(/^@/, '')
    .split('/')[0]
    .split('?')[0]
    .trim();
  return cleaned || null;
}

export function instagramDisplayLabel(raw: string): string {
  const u = extractInstagramUsername(raw);
  return u ? `@${u}` : raw.trim();
}

/** LinkedIn public path slug (in/username). */
export function extractLinkedinSlug(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const m =
    s.match(/linkedin\.com\/(?:[\w.-]+\/)*(?:in|pub)\/([^/?\s#]+)/i) ||
    s.match(/linkedin\.com\/(?:in|pub)\/([^/?\s#]+)/i);
  if (m) return m[1];
  if (!/https?:/i.test(s) && !s.includes('linkedin.com')) {
    const t = s.replace(/^in\//i, '').trim();
    return t || null;
  }
  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => p === 'in' || p === 'pub');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].split('?')[0];
  } catch {
    /* ignore */
  }
  return null;
}

export function linkedinDisplayLabel(raw: string): string {
  const slug = extractLinkedinSlug(raw);
  if (slug) return `in/${slug}`;
  return raw.trim().slice(0, 48) || raw.trim();
}

export function websiteDisplayHost(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return s;
  }
}

export function websiteFaviconUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`);
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(u.hostname)}`;
  } catch {
    return null;
  }
}
