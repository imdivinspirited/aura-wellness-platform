import { getApiBaseUrl } from './client';

/**
 * Same-origin URL for the profile photo — backend proxies Instagram CDN (browser cannot load CDN URL reliably).
 */
export function getInstagramAvatarImgUrl(username: string): string | null {
  const u = username.trim().replace(/^@/, '');
  if (!u) return null;
  return `${getApiBaseUrl()}/preview/instagram-avatar-img/${encodeURIComponent(u)}`;
}

/**
 * Same-origin URL for LinkedIn headshot — server parses `url` query (full paste) so slug extraction always matches backend.
 */
export function getLinkedinAvatarImgUrlFromRaw(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  return `${getApiBaseUrl()}/preview/linkedin-avatar-img?url=${encodeURIComponent(t)}`;
}
