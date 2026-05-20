/** Import / export helpers for resume JSON (client-side). */

import type { ResumeDocumentV1 } from '../types';

export const toJsonPretty = (r: ResumeDocumentV1, space = 2) => JSON.stringify(r, null, space);

export const fromJsonString = (s: string): ResumeDocumentV1 | null => {
  try {
    return JSON.parse(s) as ResumeDocumentV1;
  } catch {
    return null;
  }
};

export const downloadJson = (r: ResumeDocumentV1, filename = 'resume-document.json') => {
  const blob = new Blob([toJsonPretty(r)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result ?? ''));
    fr.onerror = () => reject(fr.error);
    fr.readAsText(file);
  });

export const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
};

export const canClipboard = () => !!navigator.clipboard?.writeText;

export const estimateJsonBytes = (r: ResumeDocumentV1) => new Blob([toJsonPretty(r, 0)]).size;

export const gzipFriendlyScore = (bytes: number) => (bytes < 24_000 ? 1 : Math.max(0, 1 - bytes / 500_000));
