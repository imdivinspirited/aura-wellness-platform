/**
 * Error Boundary — catches React render errors and shows a safe, actionable fallback.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Home, RefreshCw, Copy, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import t from '@/lib/i18n';
import { buildFeedbackClipboardPayload, sanitizeClientError } from '@/lib/errorDisplay';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  referenceId: string;
  safeDetail: string;
  redacted: boolean;
  copyDone: boolean;
}

function makeReferenceId(): string {
  return `AOL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

export class ErrorBoundary extends Component<Props, State> {
  private copyResetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      referenceId: '',
      safeDetail: '',
      redacted: false,
      copyDone: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const { safeDetail, redacted } = sanitizeClientError(error);
    return {
      hasError: true,
      error,
      referenceId: makeReferenceId(),
      safeDetail,
      redacted,
      copyDone: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentWillUnmount() {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
  }

  handleReset = () => {
    if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
    this.setState({
      hasError: false,
      error: null,
      referenceId: '',
      safeDetail: '',
      redacted: false,
      copyDone: false,
    });
    window.location.href = '/';
  };

  handleCopyFeedback = async () => {
    const { referenceId, safeDetail, redacted } = this.state;
    const payload = buildFeedbackClipboardPayload({ referenceId, safeDetail, redacted });
    try {
      await navigator.clipboard.writeText(payload);
      this.setState({ copyDone: true });
      if (this.copyResetTimer) clearTimeout(this.copyResetTimer);
      this.copyResetTimer = setTimeout(() => this.setState({ copyDone: false }), 3500);
    } catch {
      /* clipboard denied — ignore */
    }
  };

  render() {
    if (this.state.hasError) {
      const { referenceId, safeDetail, redacted, copyDone } = this.state;

      return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 bottom-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
            aria-hidden
          />

          <div className="relative z-[1] flex min-h-screen items-center justify-center p-4 sm:p-6">
            <div
              className="w-full max-w-lg rounded-3xl border border-border/40 bg-background/55 p-6 shadow-2xl shadow-black/10 backdrop-blur-2xl dark:bg-background/45 dark:shadow-black/40 sm:p-8"
              role="alert"
            >
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                  <Shield className="h-6 w-6 text-primary" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <h1 className="font-serif text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                    {t('errors.boundary.title')}
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t('errors.boundary.subtitle')}</p>
                </div>
              </div>

              <p className="mb-4 rounded-xl border border-border/50 bg-muted/25 px-3 py-2.5 text-sm leading-relaxed text-foreground/90">
                {t('errors.boundary.apology')}
              </p>

              <div className="mb-5 space-y-3 rounded-2xl border border-dashed border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                <p>{t('errors.boundary.feedbackPrompt')}</p>
                <p className="font-medium text-foreground/85">{t('errors.boundary.teamNote')}</p>
              </div>

              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('errors.boundary.referenceLabel')}
                </p>
                <code className="block w-full break-all rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 font-mono text-sm text-foreground">
                  {referenceId}
                </code>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('errors.boundary.technicalSummary')}
                </p>
                {redacted || !safeDetail ? (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3 py-2.5 text-sm leading-relaxed text-amber-950 dark:text-amber-100/95">
                    {t('errors.boundary.detailRedacted')}
                  </p>
                ) : (
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground/90">
                    {safeDetail}
                  </pre>
                )}
              </div>

              <div className="mb-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-primary/25 bg-background/60 sm:flex-1"
                  onClick={this.handleCopyFeedback}
                >
                  {copyDone ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                  {copyDone ? t('errors.boundary.copied') : t('errors.boundary.copyFeedback')}
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button onClick={this.handleReset} className="w-full gap-2 sm:flex-1">
                  <Home className="h-4 w-4" aria-hidden />
                  {t('errors.boundary.goHome')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full gap-2 sm:flex-1"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  {t('errors.boundary.reload')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
