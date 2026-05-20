import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRootOperatorApiBase, getFetchFailureMessage } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

function passwordStrengthLabel(p: string): { label: string; score: number } {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  return { label, score };
}

export default function RootSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showSk, setShowSk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pwMatch = confirmPassword.length > 0 && password === confirmPassword;
  const pwBad = confirmPassword.length > 0 && password !== confirmPassword;
  const strength = passwordStrengthLabel(password);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        const base = getRootOperatorApiBase();
        const r = await fetch(`${base}/root/signup`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            confirmPassword,
            secretKey,
          }),
        });
        let j: { error?: { message?: string; code?: string }; message?: string; success?: boolean } = {};
        try {
          j = (await r.json()) as typeof j;
        } catch {
          setError(
            r.status >= 500
              ? 'Server error or API not reachable. Is the backend running on port 4000?'
              : 'Invalid response from server.'
          );
          return;
        }
        if (r.status === 201) {
          setSuccess(true);
          window.setTimeout(() => navigate('/root/login', { replace: true }), 2000);
          return;
        }
        if (
          r.status === 404 &&
          (j.error?.code === 'NOT_FOUND' || String(j.error?.message || j.message || '').includes('No route'))
        ) {
          setError(
            'Root API route not found. Usually port 4000 is running an old Node process. Stop it, then run `npm run dev` in the `backend` folder (or `npm run dev:stack` from the project root), and try again.'
          );
          return;
        }
        if (r.status === 429 || j.error?.code === 'RATE_LIMIT') {
          setError(
            'Rate limit (429). The backend on port 4000 may be an old build that still limits root signup. Stop every Node process using port 4000, then run `npm run dev` inside the `backend` folder and try again.'
          );
          return;
        }
        const msg = j.error?.message || 'Signup failed';
        if (r.status === 403 && j.error?.code === 'ROOT_EXISTS') {
          // API message is complete (avoid appending "Please sign in again" — it duplicated text).
          setError(msg);
        } else if (r.status === 403) {
          setError('Incorrect secret key');
        } else {
          setError(msg);
        }
      } catch (e) {
        setError(getFetchFailureMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [fullName, email, password, confirmPassword, secretKey, navigate]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/90 shadow-2xl">
        <CardHeader>
          <CardTitle className="font-display text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            Root sign up
          </CardTitle>
          <CardDescription className="text-zinc-400">
            One root account per deployment. Requires the shared secret phrase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="border-emerald-800 bg-emerald-950/40 text-emerald-200">
              <AlertDescription>Root account created successfully. Redirecting to sign in…</AlertDescription>
            </Alert>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              {error && (
                <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-200">
                  <AlertDescription>
                    {error}{' '}
                    {error.includes('sign in instead') && (
                      <Link to="/root/login" className="underline text-amber-400 ml-1">
                        Sign in
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fn">Full name</Label>
                <Input
                  id="fn"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-zinc-950 border-zinc-700"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em">Email</Label>
                <Input
                  id="em"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-700"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">Password</Label>
                <div className="relative">
                  <Input
                    id="pw"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950 border-zinc-700 pr-10"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full',
                            i < strength.score ? 'bg-amber-500' : 'bg-zinc-700'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">Strength: {strength.label}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw2">Confirm password</Label>
                <Input
                  id="pw2"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-700"
                  required
                  autoComplete="new-password"
                />
                {confirmPassword.length > 0 && (
                  <p className={cn('text-xs', pwMatch ? 'text-emerald-500' : 'text-red-400')}>
                    {pwMatch ? '✓ Passwords match' : pwBad ? '✗ Passwords do not match' : null}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sk">Secret key</Label>
                <div className="relative">
                  <Input
                    id="sk"
                    type={showSk ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="bg-zinc-950 border-zinc-700 pr-10"
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
                    onClick={() => setShowSk((v) => !v)}
                  >
                    {showSk ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950"
                disabled={loading}
              >
                {loading ? 'Creating…' : 'Create root account'}
              </Button>
              <p className="text-center text-sm text-zinc-500">
                Already have access?{' '}
                <Link to="/root/login" className="text-amber-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
