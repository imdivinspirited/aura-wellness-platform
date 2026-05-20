/** Lightweight PII hints in the query box (client-side heuristic, not DLP). */

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_IN = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}\b/;
const CC = /\b(?:\d[ -]*?){13,19}\b/;

export function detectSensitiveQueryInput(q: string): 'email' | 'phone' | 'card' | null {
  const t = q.trim();
  if (t.length < 5) return null;
  if (EMAIL.test(t)) return 'email';
  if (CC.test(t.replace(/\s/g, '')) && t.replace(/\D/g, '').length >= 13) return 'card';
  if (PHONE_IN.test(t)) return 'phone';
  return null;
}
