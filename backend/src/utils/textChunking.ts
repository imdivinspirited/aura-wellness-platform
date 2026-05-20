export function chunkText(text: string, opts?: { maxChars?: number; overlapChars?: number }): string[] {
  const maxChars = opts?.maxChars ?? 1400;
  const overlapChars = opts?.overlapChars ?? 200;
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars);
    let cut = clean.lastIndexOf('. ', end);
    if (cut <= i + Math.floor(maxChars * 0.6)) cut = end;
    const part = clean.slice(i, cut).trim();
    if (part) chunks.push(part);
    i = Math.max(i + 1, cut - overlapChars);
    if (cut === clean.length) break;
  }
  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (!denom) return -1;
  return dot / denom;
}

