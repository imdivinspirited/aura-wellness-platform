import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmVerifyEmail } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = useMemo(() => params.get('email') || '', [params]);
  const token = useMemo(() => params.get('token') || '', [params]);

  const [status, setStatus] = useState<'working' | 'ok' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!email || !token) {
        setStatus('error');
        setError('Missing verification token.');
        return;
      }
      try {
        await confirmVerifyEmail({ email, token });
        if (cancelled) return;
        setStatus('ok');
        // Give a moment for the user to read the success state
        setTimeout(() => navigate('/profile', { replace: true }), 700);
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Verification failed.');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [email, token, navigate]);

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Email verification</CardTitle>
            <CardDescription>We’re confirming your email…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {status === 'working' ? (
              <p className="text-sm text-muted-foreground">Please wait.</p>
            ) : status === 'ok' ? (
              <p className="text-sm text-muted-foreground">Verified. Redirecting…</p>
            ) : (
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

