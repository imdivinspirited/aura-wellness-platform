/**
 * Cache-bust avatar URLs after upload (matches Profile page behaviour).
 */
export function avatarUrlWithCacheBuster(
  base: string | undefined | null,
  avatarUpdatedAt?: string | null,
): string {
  if (!base || base.startsWith('blob:')) return base || '';
  const v = avatarUpdatedAt;
  const clean = base.split('?')[0];
  return v ? `${clean}?v=${encodeURIComponent(String(v))}` : base;
}
