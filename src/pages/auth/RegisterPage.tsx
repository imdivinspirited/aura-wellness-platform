import { AuthSplitLayout } from '@/components/auth/AuthSplitLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  register as registerAccount,
  getSignupWatchStatus,
  type RegisterRequestResponse,
} from '@/lib/api/auth';
import { Eye, EyeOff } from 'lucide-react';

export type RegisterPageProps = {
  /** Omit MainLayout when nested (e.g. Profile dashboard shell). */
  embedded?: boolean;
};

export default function RegisterPage({ embedded = false }: RegisterPageProps) {
  const { isAuthenticated, isLoading: authBootLoading } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean | null>(null);
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [remoteVerified, setRemoteVerified] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const mark = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  /** Matches `backend/src/routes/authRoutes.js` registerSchema (Argon2 on server). */
  const pwStrong = (p: string) =>
    p.length >= 10 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);

  const passwordStrengthScore = (p: string) =>
    [p.length >= 10, /[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p)].filter(Boolean).length;

  const strengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  useEffect(() => {
    if (!authBootLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authBootLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!sent || !linkExpiresAt || remoteVerified) {
      if (remoteVerified) setSecondsLeft(null);
      return;
    }
    const end = new Date(linkExpiresAt).getTime();
    const tick = () => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(s);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sent, linkExpiresAt, remoteVerified]);

  /** When the user confirms the magic link on another device/tab, this tab detects it and redirects to login. */
  useEffect(() => {
    if (!sent || !watchId || remoteVerified) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await getSignupWatchStatus(watchId);
        if (cancelled) return;
        if (r.status === 'verified') {
          setRemoteVerified(true);
          setLinkExpiresAt(null);
          window.setTimeout(() => {
            navigate('/auth/login?verified=1', { replace: true });
          }, 2200);
        }
      } catch {
        /* network blips — keep polling */
      }
    };
    void poll();
    const interval = window.setInterval(poll, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [sent, watchId, remoteVerified, navigate]);

  const cardClassName = embedded
    ? 'aol-auth-card border-border/80 shadow-lg shadow-primary/5 w-full min-w-0'
    : 'w-full min-w-0 border-0 bg-transparent shadow-none ring-0 rounded-none';

  const headerCls = embedded ? 'space-y-1' : 'space-y-0.5 p-0 pb-1.5';
  const contentCls = embedded ? 'space-y-4' : 'space-y-2 p-0';
  const titleCls = embedded ? 'font-display text-2xl' : 'font-display text-lg sm:text-xl leading-tight';
  const fieldH = embedded ? 'min-h-[48px]' : 'h-10 min-h-0 text-sm';
  const labelCls = embedded ? undefined : 'text-xs font-medium leading-tight';
  const formGap = embedded ? 'space-y-4' : 'space-y-2';
  const fieldGap = embedded ? 'space-y-2' : 'space-y-1';

  const card = (
            <Card className={cardClassName}>
              <CardHeader className={headerCls}>
                <CardTitle className={titleCls}>Create account</CardTitle>
                <CardDescription className={embedded ? undefined : 'text-xs sm:text-sm'}>
                  Join to access your dashboard and personalized services.
                </CardDescription>
              </CardHeader>
              <CardContent className={contentCls}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {sent ? (
                  <div
                    className={
                      embedded ? 'text-sm text-muted-foreground space-y-2' : 'text-xs sm:text-sm text-muted-foreground space-y-1.5 leading-snug'
                    }
                  >
                    {remoteVerified && (
                      <Alert className="border-emerald-500/50 bg-emerald-500/10 text-foreground">
                        <AlertDescription>
                          <span className="font-medium text-emerald-800 dark:text-emerald-200">
                            Email verified successfully.
                          </span>{' '}
                          Redirecting you to sign in…
                        </AlertDescription>
                      </Alert>
                    )}
                    {verificationEmailSent === false ? (
                      <Alert className="border-amber-500/50 bg-amber-500/10 text-foreground">
                        <AlertDescription>
                          <span className="font-medium">No new verification email was sent in this request.</span>{' '}
                          Common reasons: this address is already registered (try signing in), too many sign-up attempts
                          in 24 hours, or SMTP misconfiguration. Check Spam for an older message, or run{' '}
                          <code className="text-xs bg-muted px-1 rounded">cd backend &amp;&amp; npm run test:smtp</code> on
                          the machine that runs the API.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                    {!remoteVerified && verificationEmailSent === true && secondsLeft !== null && secondsLeft > 0 && (
                      <div
                        className={
                          embedded
                            ? 'rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'
                            : 'rounded-md border border-primary/25 bg-primary/5 px-3 py-2 flex flex-row items-center justify-between gap-2'
                        }
                        role="status"
                        aria-live="polite"
                      >
                        <span className={embedded ? 'text-sm font-medium text-foreground' : 'text-xs font-medium text-foreground'}>
                          Link expires in
                        </span>
                        <span
                          className={
                            embedded
                              ? 'text-2xl font-mono font-semibold tabular-nums tracking-tight text-primary'
                              : 'text-lg font-mono font-semibold tabular-nums tracking-tight text-primary'
                          }
                        >
                          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                          {String(secondsLeft % 60).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                    {!remoteVerified && verificationEmailSent === true && secondsLeft === 0 && (
                      <Alert className="border-amber-600/50 bg-amber-500/10 text-foreground">
                        <AlertDescription>
                          This verification window ended. Submit the form again with the same email and password to get a
                          new link.
                        </AlertDescription>
                      </Alert>
                    )}
                    <p>
                      {remoteVerified ? (
                        <span className="text-muted-foreground">
                          You can sign in on this device with <span className="font-medium text-foreground">{email.trim()}</span>.
                        </span>
                      ) : verificationEmailSent === true ? (
                        <>
                          We sent a verification link to{' '}
                          <span className="font-medium text-foreground">{email.trim()}</span>. Open your inbox (and Spam)
                          and tap the link within the time above — your account is created only after you confirm. This page
                          updates automatically when you confirm (even from another device).
                        </>
                      ) : verificationEmailSent === false ? (
                        <>
                          If you expected an email and see the notice above, try signing in, wait before retrying, or use a
                          different address. For <span className="font-medium text-foreground">{email.trim()}</span>, also
                          check Spam / Promotions.
                        </>
                      ) : (
                        <>
                          Next step: verify your email for{' '}
                          <span className="font-medium text-foreground">{email.trim()}</span>. If the API is older, refresh
                          the page after upgrading the server.
                        </>
                      )}
                    </p>
                    <div className="pt-2">
                      <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                        Back to sign in
                      </Link>
                    </div>
                  </div>
                ) : (
                <form
                  className={formGap}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError(null);
                    mark('name');
                    mark('email');
                    mark('password');
                    mark('password2');
                    if (!name.trim() || !email.trim() || !password) {
                      setError('Please complete all required fields.');
                      return;
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                      setError('Enter a valid email address.');
                      return;
                    }
                    if (!pwStrong(password)) {
                      setError(
                        'Password must be at least 10 characters and include uppercase, lowercase, and a number.'
                      );
                      return;
                    }
                    if (password !== password2) {
                      setError('Passwords do not match.');
                      return;
                    }
                    setLoading(true);
                    try {
                      const r = (await registerAccount(
                        {
                          name,
                          email,
                          password,
                          phone: phone.trim() ? phone.trim() : undefined,
                        },
                        { storeSession: false }
                      )) as unknown as RegisterRequestResponse;
                      setSent(true);
                      setVerificationEmailSent(
                        typeof r?.verificationEmailSent === 'boolean' ? r.verificationEmailSent : null
                      );
                      setLinkExpiresAt(r?.linkExpiresAt || null);
                      setWatchId(typeof r?.watchId === 'string' ? r.watchId : null);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Registration failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <div className={embedded ? 'flex flex-col gap-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-x-2 sm:gap-y-2'}>
                  <div className={fieldGap}>
                    <Label htmlFor="name" className={labelCls}>
                      Full name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => mark('name')}
                      required
                      autoComplete="name"
                      aria-label="Full name"
                      aria-invalid={touched.name && !name.trim()}
                      className={fieldH}
                    />
                    {touched.name && !name.trim() && (
                      <p className="text-xs text-destructive" role="alert">
                        Required
                      </p>
                    )}
                  </div>
                  <div className={fieldGap}>
                    <Label htmlFor="email" className={labelCls}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => mark('email')}
                      required
                      autoComplete="email"
                      aria-label="Email"
                      aria-invalid={touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
                      className={fieldH}
                    />
                    {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
                      <p className="text-xs text-destructive" role="alert">
                        Valid email required
                      </p>
                    )}
                  </div>
                  </div>
                  <div className={fieldGap}>
                    <Label htmlFor="phone" className={labelCls}>
                      Phone (optional)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      aria-label="Phone"
                      className={fieldH}
                    />
                  </div>
                  <div className={fieldGap}>
                    <Label htmlFor="password" className={labelCls}>
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => mark('password')}
                        minLength={10}
                        required
                        autoComplete="new-password"
                        aria-label="Password"
                        aria-describedby="pw-rules"
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
                    <p id="pw-rules" className={embedded ? 'text-xs text-muted-foreground' : 'text-[11px] leading-tight text-muted-foreground'}>
                      {embedded
                        ? 'At least 10 characters with uppercase, lowercase, and a number (same rules as the server).'
                        : '10+ chars, upper, lower, number (server rules).'}
                    </p>
                    {touched.password && !pwStrong(password) && password.length > 0 && (
                      <p className="text-xs text-destructive" role="alert">
                        Password does not meet requirements
                      </p>
                    )}
                    {password.length > 0 && (
                      <div className={embedded ? 'space-y-2 pt-1' : 'flex items-center gap-2 pt-0.5'} aria-live="polite">
                        <div className="flex flex-1 gap-0.5">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`${embedded ? 'h-1.5' : 'h-1'} flex-1 rounded-full transition-colors ${
                                i < passwordStrengthScore(password)
                                  ? passwordStrengthScore(password) >= 4
                                    ? 'bg-emerald-500'
                                    : passwordStrengthScore(password) >= 3
                                      ? 'bg-primary'
                                      : 'bg-amber-500'
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="shrink-0 text-[11px] text-muted-foreground sm:text-xs">
                          <span className="font-medium text-foreground">{strengthLabel(passwordStrengthScore(password))}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={fieldGap}>
                    <Label htmlFor="password2" className={labelCls}>
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password2"
                        name="password2"
                        type={showPw2 ? 'text' : 'password'}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        onBlur={() => mark('password2')}
                        required
                        autoComplete="new-password"
                        aria-label="Confirm password"
                        className={`${fieldH} pr-11`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        onClick={() => setShowPw2((v) => !v)}
                        aria-label={showPw2 ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {touched.password2 && password2 && password2 !== password && (
                      <p className="text-xs text-destructive" role="alert">
                        Passwords must match
                      </p>
                    )}
                  </div>

                  <Button className={`w-full ${fieldH}`} type="submit" disabled={loading || authBootLoading}>
                    {loading ? 'Creating…' : 'Create account'}
                  </Button>
                  <div className={embedded ? 'text-sm text-muted-foreground text-center' : 'text-xs text-muted-foreground text-center pt-0.5'}>
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                      Sign in
                    </Link>
                  </div>
                </form>
                )}
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
      headline="Join the community"
      description="Create an account for programs, events, and personalized wellness at the Bangalore Ashram."
      footline="Your journey begins with one breath"
    >
      {card}
    </AuthSplitLayout>
  );
}
