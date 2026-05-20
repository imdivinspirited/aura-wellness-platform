/**
 * Dependency-free minimal PDF generator for simple text documents.
 *
 * Notes:
 * - Single page, Helvetica, basic line wrapping.
 * - Good enough for "resume download" until npm install is fixed.
 */

function escapePdfText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function generateSimplePdf(input: {
  title?: string;
  lines: string[];
  author?: string;
}): Buffer {
  const pageWidth = 612; // 8.5in * 72
  const pageHeight = 792; // 11in * 72
  const margin = 54; // 0.75in
  const fontSize = 11;
  const leading = 14;

  const title = input.title?.trim();
  const lines = input.lines.flatMap((l) => (l ?? '').toString().split('\n'));

  // Very simple wrap based on character count (Helvetica approx).
  const maxChars = 95;
  const wrapped: string[] = [];
  for (const raw of lines) {
    const txt = raw.trimEnd();
    if (!txt) {
      wrapped.push('');
      continue;
    }
    let s = txt;
    while (s.length > maxChars) {
      let cut = s.lastIndexOf(' ', maxChars);
      if (cut < Math.floor(maxChars * 0.6)) cut = maxChars;
      wrapped.push(s.slice(0, cut).trimEnd());
      s = s.slice(cut).trimStart();
    }
    wrapped.push(s);
  }

  let y = pageHeight - margin;
  const contentParts: string[] = [];
  contentParts.push('BT');
  contentParts.push('/F1 11 Tf');
  contentParts.push(`${margin} ${y} Td`);

  const writeLine = (text: string, size = fontSize) => {
    contentParts.push(`/F1 ${size} Tf`);
    contentParts.push(`(${escapePdfText(text)}) Tj`);
    contentParts.push(`0 -${leading} Td`);
    y -= leading;
  };

  if (title) {
    writeLine(title, 16);
    writeLine('', 11);
  }

  for (const line of wrapped) {
    // If we run off the page, we just stop (still a valid PDF).
    if (y < margin) break;
    writeLine(line, 11);
  }

  contentParts.push('ET');
  const stream = contentParts.join('\n') + '\n';
  const streamBytes = Buffer.from(stream, 'utf8');

  const objects: string[] = [];
  const offsets: number[] = [];
  const pushObj = (obj: string) => {
    offsets.push(Buffer.byteLength(objects.join(''), 'utf8'));
    objects.push(obj);
  };

  const header = '%PDF-1.4\n%âãÏÓ\n';

  // 1: Catalog
  pushObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  // 2: Pages
  pushObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  // 3: Page
  pushObj(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );
  // 4: Font
  pushObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  // 5: Contents stream
  pushObj(`5 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream\nendobj\n`);
  // 6: Info
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const pdfDate = `D:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const author = input.author?.trim();
  pushObj(
    `6 0 obj\n<< /Producer (The AOLIC Bangalore) /CreationDate (${pdfDate})${
      author ? ` /Author (${escapePdfText(author)})` : ''
    } >>\nendobj\n`
  );

  const body = objects.join('');
  const xrefStart = Buffer.byteLength(header + body, 'utf8');

  // xref needs offsets from start of file.
  const xrefLines: string[] = [];
  xrefLines.push('xref');
  xrefLines.push('0 7');
  xrefLines.push('0000000000 65535 f ');
  for (let i = 0; i < offsets.length; i++) {
    const off = Buffer.byteLength(header, 'utf8') + offsets[i];
    xrefLines.push(`${off.toString().padStart(10, '0')} 00000 n `);
  }

  const trailer = [
    'trailer',
    '<<',
    '/Size 7',
    '/Root 1 0 R',
    '/Info 6 0 R',
    '>>',
    'startxref',
    `${xrefStart}`,
    '%%EOF\n',
  ].join('\n');

  const pdf = header + body + xrefLines.join('\n') + '\n' + trailer;
  return Buffer.from(pdf, 'utf8');
}

