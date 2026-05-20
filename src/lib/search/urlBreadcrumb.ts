/** Breadcrumb-style path from site URL (for result metadata). */
export function urlPathBreadcrumb(url: string): string {
  const path = url.startsWith('http') ? new URL(url).pathname : url;
  return path
    .split('/')
    .filter(Boolean)
    .join(' › ');
}
