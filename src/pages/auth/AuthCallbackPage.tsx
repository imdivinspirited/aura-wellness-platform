import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const applyOAuthTokens = useAuthStore((s) => s.applyOAuthTokens);
  const completeOAuthFromCookie = useAuthStore((s) => s.completeOAuthFromCookie);

  useEffect(() => {
    const oauth = params.get('oauth');
    const accessToken = params.get('accessToken') || '';
    const refreshToken = params.get('refreshToken') || '';

    /** Preferred: httpOnly cookie set by API — no secrets in URL or browser history. */
    if (oauth === 'success') {
      completeOAuthFromCookie()
        .then(() => navigate('/profile', { replace: true }))
        .catch(() => navigate('/auth/login?oauth=failed', { replace: true }));
      return;
    }

    /** Legacy: tokens in query (deprecated; keep until all environments migrate). */
    if (accessToken && refreshToken) {
      applyOAuthTokens({ accessToken, refreshToken })
        .then(() => navigate('/profile', { replace: true }))
        .catch(() => navigate('/auth/login?oauth=failed', { replace: true }));
      return;
    }

    navigate('/auth/login?oauth=failed', { replace: true });
  }, [applyOAuthTokens, completeOAuthFromCookie, navigate, params]);

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Signing you in…</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Please wait while we securely finish your login.
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
