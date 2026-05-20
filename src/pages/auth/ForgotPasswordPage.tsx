import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { forgotPassword } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>We’ll email you a reset link if the account exists.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {sent ? (
              <div className="text-sm text-muted-foreground">
                If an account exists for <span className="font-medium">{email}</span>, a password reset link has been sent.
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setLoading(true);
                  try {
                    await forgotPassword(email);
                    setSent(true);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to send reset email');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

