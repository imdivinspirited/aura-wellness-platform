/**
 * Sanitize client-side errors before showing anything to the user.
 * Blocks messages that could expose secrets, credentials, stack internals, or help attackers.
 */

import t from '@/lib/i18n';

const SENSITIVE_PATTERNS: RegExp[] = [
  /password|passwd|pwd|secret|api[_\s-]?key|private[_\s-]?key|access[_\s-]?token|refresh[_\s-]?token|session[_\s-]?id/i,
  /\bbearer\s+/i,
  /mongodb(\+srv)?:\/\//i,
  /postgres(ql)?:\/\//i,
  /mysql:\/\//i,
  /redis:\/\//i,
  /:\/\/[^/\s]+:[^@/\s]+@/i,
  /authorization\s*:/i,
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/,
  /\bsk_(live|test)_/i,
  /\bpk_(live|test)_/i,
  /AKIA[0-9A-Z]{16}/,
  /AWS_SECRET/i,
  /BEGIN (RSA |OPENSSH )?PRIVATE KEY/i,
];

/** Bundles / internals that leak build layout — hide raw message. */
const INTERNAL_LEAK_PATTERNS: RegExp[] = [
  /webpack/i,
  /__SECRET_INTERNALS/i,
  /chunk\.[a-z0-9_-]+\.js/i,
  /node_modules[/\\]/i,
];

function looksSensitive(text: string): boolean {
  const t = text.slice(0, 4000);
  return SENSITIVE_PATTERNS.some((re) => re.test(t)) || INTERNAL_LEAK_PATTERNS.some((re) => re.test(t));
}

export type SanitizedClientError = {
  safeDetail: string;
  redacted: boolean;
};

/**
 * Produce a short, user-visible summary. Never includes stack traces.
 */
export function sanitizeClientError(error: Error | null | undefined): SanitizedClientError {
  if (!error) {
    return { safeDetail: '', redacted: true };
  }

  const name = (error.name || 'Error').slice(0, 80);
  let msg = String(error.message ?? '').trim().slice(0, 1200);

  if (!msg) {
    return { safeDetail: name, redacted: false };
  }

  if (looksSensitive(msg)) {
    return { safeDetail: '', redacted: true };
  }

  msg = msg.replace(/<script\b/gi, '[removed]');
  msg = msg.replace(/\b[0-9a-f]{40,}\b/gi, '[filtered]');

  const combined = `${name}: ${msg}`.slice(0, 480);
  return { safeDetail: combined, redacted: false };
}

export function buildFeedbackClipboardPayload(params: {
  referenceId: string;
  safeDetail: string;
  redacted: boolean;
}): string {
  const { referenceId, safeDetail, redacted } = params;
  const lines = [
    t('errors.boundary.feedbackEmailSubjectPrefix'),
    '',
    `${t('errors.boundary.referenceLabel')}: ${referenceId}`,
    `${t('errors.boundary.feedbackPageLabel')}: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    `${t('errors.boundary.feedbackTimeLabel')}: ${new Date().toISOString()}`,
  ];

  if (redacted || !safeDetail) {
    lines.push(`${t('errors.boundary.technicalSummary')}: ${t('errors.boundary.detailRedacted')}`);
  } else {
    lines.push(`${t('errors.boundary.technicalSummary')}: ${safeDetail}`);
  }

  lines.push('', t('errors.boundary.feedbackFooterNote'));
  return lines.join('\n');
}
