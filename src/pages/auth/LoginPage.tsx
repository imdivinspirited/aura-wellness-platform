import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff } from 'lucide-react';

const REMEMBER_KEY = 'aol-auth-remember-email';

/** Internal path only — avoids open redirects via `next` / `redirect` query. */
function postLoginPath(searchParams: URLSearchParams): string {
  const raw = (searchParams.get('next') ?? searchParams.get('redirect') ?? '').trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) {
    return '/dashboard';
  }
  return raw;
}

export type LoginPageProps = {
  /**
   * When true, render only the form (no MainLayout). Use inside Profile or other shells that already provide layout.
   */
  embedded?: boolean;
};

export default function LoginPage({ embedded = false }: LoginPageProps) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, oauthStart, isAuthenticated, isLoading: authBootLoading } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ id: false, pw: false });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [need2fa, setNeed2fa] = useState(false);

  const oauthFailed = params.get('oauth') === 'failed';
  const resetSuccess = params.get('reset') === 'success';
  const registeredOk = params.get('registered') === '1';
  const emailVerifiedOk = params.get('verified') === '1';

  useEffect(() => {
    if (!authBootLoading && isAuthenticated) {
      navigate(postLoginPath(params), { replace: true });
    }
  }, [authBootLoading, isAuthenticated, navigate, params]);

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(REMEMBER_KEY);
        if (saved) {
          setIdentifier(saved);
          setRemember(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const cardClassName = embedded
    ? 'aol-auth-card border-border/80 shadow-lg shadow-primary/5 w-full min-w-0'
    : 'w-full min-w-0 border-0 bg-transparent shadow-none ring-0 rounded-none';

  const headerCls = embedded ? 'space-y-1' : 'space-y-0.5 px-0 pb-2 pt-0 sm:pb-3';
  const contentCls = embedded ? 'space-y-4' : 'space-y-3 px-0 pb-0 pt-0';
  const titleCls = embedded ? 'font-display text-2xl' : 'font-display text-xl sm:text-2xl';
  const fieldH = embedded ? 'min-h-[48px]' : 'min-h-[44px]';

  const card = (
            <Card className={cardClassName}>
              <CardHeader className={headerCls}>
                <CardTitle className={titleCls}>Sign in</CardTitle>
                <CardDescription className={embedded ? undefined : 'text-xs sm:text-sm'}>
                  Access your dashboard, settings, and orders.
                </CardDescription>
              </CardHeader>
              <CardContent className={contentCls}>
                {emailVerifiedOk && (
                  <Alert className="border-emerald-500/40 bg-emerald-500/10 text-foreground">
                    <AlertDescription>
                      Email verified and your account is active. Sign in with your email and password.
                    </AlertDescription>
                  </Alert>
                )}
                {registeredOk && !emailVerifiedOk && (
                  <Alert>
                    <AlertDescription>Account created. Sign in with your email and password.</AlertDescription>
                  </Alert>
                )}
                {resetSuccess && (
                  <Alert>
                    <AlertDescription>Password updated. Please sign in.</AlertDescription>
                  </Alert>
                )}
                {(oauthFailed || error) && (
                  <Alert variant="destructive">
                    <AlertDescription>{error || 'Social login failed. Please try again.'}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <Button type="button" variant="outline" className={embedded ? 'h-12 min-h-[44px]' : 'h-11 min-h-[44px]'} onClick={() => oauthStart('google')}>
                    Google
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>

                <form
                  className={embedded ? 'space-y-4' : 'space-y-3'}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);
                    setTouched({ id: true, pw: true });
                    if (!identifier.trim() || !password) {
                      setError('Please enter email and password.');
                      return;
                    }
                    setLoading(true);
                    try {
                      await login({ identifier, password, rememberMe: remember, twoFactorCode: need2fa ? twoFactorCode : undefined });
                      try {
                        if (typeof localStorage !== 'undefined') {
                          if (remember) localStorage.setItem(REMEMBER_KEY, identifier.trim());
                          else localStorage.removeItem(REMEMBER_KEY);
                        }
                      } catch {
                        /* ignore */
                      }
                      navigate(postLoginPath(params), { replace: true });
                    } catch (err) {
                      const msg =
                        err instanceof Error && err.message
                          ? err.message
                          : 'Invalid credentials. Check email/phone and password.';
                      const lower = msg.toLowerCase();
                      if (lower.includes('two-factor code required')) {
                        setNeed2fa(true);
                        setError('Two-factor code required. Enter the 6-digit code from your authenticator app.');
                      } else if (lower.includes('invalid two-factor')) {
                        setNeed2fa(true);
                        setError('Invalid two-factor code. Try again.');
                      } else if (lower.includes('too many') && lower.includes('two-factor')) {
                        setError(msg);
                      } else {
                        setError(msg);
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Email or phone</Label>
                    <Input
                      id="identifier"
                      name="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, id: true }))}
                      required
                      placeholder="you@example.com"
                      autoComplete="username"
                      aria-label="Email or phone"
                      aria-invalid={touched.id && !identifier.trim()}
                      aria-describedby="login-id-hint"
                      className={fieldH}
                    />
                    <p id="login-id-hint" className="text-xs text-muted-foreground">
                      {touched.id && !identifier.trim()
                        ? 'Required'
                        : touched.id &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim()) &&
                            identifier.trim().length < 6
                          ? 'Enter a valid email or phone'
                          : '\u00a0'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
                        required
                        autoComplete="current-password"
                        aria-label="Password"
                        aria-invalid={touched.pw && !password}
                        className={`${fieldH} pr-11`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {touched.pw && !password && (
                      <p className="text-xs text-destructive" role="alert">
                        Required
                      </p>
                    )}
                  </div>

                  {need2fa && (
                    <div className="space-y-2">
                      <Label htmlFor="two-factor">Two-factor code</Label>
                      <Input
                        id="two-factor"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="123 456"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className={fieldH}
                      />
                      <p className="text-xs text-muted-foreground">If you lost access, use a recovery code.</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={remember}
                        onCheckedChange={(v) => setRemember(v === true)}
                        aria-label="Remember me on this device"
                      />
                      <span>Remember me</span>
                    </label>
                    <Link to="/auth/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button className={`w-full ${fieldH}`} type="submit" disabled={loading || authBootLoading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>
                <div className="text-sm text-muted-foreground text-center pt-2">
                  <span className="mr-1">New here?</span>
                  <Link
                    to="/auth/register"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </div>
              </CardContent>
            </Card>
  );

  if (embedded) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5">
        {card}
      </div>
    );
  }

  return (
    <AuthSplitLayout
      headline="Welcome back"
      description="Continue your journey with meditation, programs, and community at Art of Living Bangalore Ashram."
      footline="Breathe · Smile · Live"
    >
      {card}
    </AuthSplitLayout>
  );
}
