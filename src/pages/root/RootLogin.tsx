import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRootAuth } from '@/hooks/useRootAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function RootLogin() {
  const navigate = useNavigate();
  const { login } = useRootAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showSk, setShowSk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/90 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="font-display text-2xl flex items-center gap-2">
            <Lock className="h-6 w-6 text-amber-500" />
            Root sign in
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Use your root email, password, and the shared secret phrase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                await login({ email: email.trim().toLowerCase(), password, secretKey });
                navigate('/root/dashboard', { replace: true });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Sign in failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            {error && (
              <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="rid">Email</Label>
              <Input
                id="rid"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpw">Password</Label>
              <div className="relative">
                <Input
                  id="rpw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rsk">Secret key</Label>
              <div className="relative">
                <Input
                  id="rsk"
                  type={showSk ? 'text' : 'password'}
                  autoComplete="off"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 p-1"
                  onClick={() => setShowSk((v) => !v)}
                  aria-label={showSk ? 'Hide secret' : 'Show secret'}
                >
                  {showSk ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-zinc-950" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have root access?{' '}
              <Link to="/root/signup" className="text-amber-500 hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-center text-xs text-zinc-600">
              <Link to="/settings" className="hover:text-zinc-400">
                Back to Settings
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
