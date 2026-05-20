import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmSignupVerification } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

type OkDetails = {
  email: string;
  name: string;
  verifiedAt: Date;
};

export default function VerifySignupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const email = useMemo(() => params.get('email') || '', [params]);
  const token = useMemo(() => params.get('token') || '', [params]);

  const [status, setStatus] = useState<'working' | 'ok' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<OkDetails | null>(null);
  const redirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!email || !token) {
        setStatus('error');
        setError('Missing signup verification token.');
        return;
      }
      try {
        const r = await confirmSignupVerification({ email, token });
        if (cancelled) return;
        const u = r.data?.user;
        await logout();
        if (cancelled) return;
        setDetails({
          email: u?.email ?? email,
          name: u?.name ?? '—',
          verifiedAt: new Date(),
        });
        setStatus('ok');
        redirectRef.current = setTimeout(() => {
          navigate('/auth/login?verified=1', { replace: true });
        }, 3800);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Verification failed.');
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
  }, [email, logout, navigate, token]);

  const formattedWhen = details
    ? details.verifiedAt.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'medium',
      })
    : '';

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <Card className="overflow-hidden border-border/80 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-xl sm:text-2xl">Email verification</CardTitle>
            <CardDescription>
              {status === 'working'
                ? 'Confirming your link…'
                : status === 'ok'
                  ? 'Your account is ready.'
                  : 'We could not verify this link.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'working' && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary shrink-0" aria-hidden />
                <p className="text-sm">Securing your session and creating your account…</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {status === 'ok' && details && (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center text-center gap-3 py-2">
                    <motion.div
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                      className="rounded-full bg-emerald-500/15 p-4 ring-2 ring-emerald-500/30"
                    >
                      <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </motion.div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">Registered successfully</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Email confirmed — no extra steps needed.
                      </p>
                    </div>
                  </div>

                  <motion.dl
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-lg border border-border/80 bg-muted/40 px-4 py-3 text-sm space-y-2"
                  >
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground shrink-0">Name</dt>
                      <dd className="font-medium text-right break-words">{details.name}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground shrink-0">Email</dt>
                      <dd className="font-medium text-right break-all">{details.email}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground shrink-0">Verified</dt>
                      <dd className="text-right tabular-nums">{formattedWhen}</dd>
                    </div>
                  </motion.dl>

                  <p className="text-xs text-center text-muted-foreground animate-pulse">
                    Redirecting to sign in…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{error || 'Invalid or expired link.'}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
