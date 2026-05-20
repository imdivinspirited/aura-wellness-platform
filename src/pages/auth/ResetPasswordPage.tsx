import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/lib/api/auth';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token') || '', [params]);
  const email = useMemo(() => params.get('email') || '', [params]);

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = token && email && newPassword.length >= 8 && newPassword === confirm;

  return (
    <MainLayout>
      <div className="container py-10 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Choose a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setLoading(true);
                try {
                  await resetPassword({ email, token, newPassword });
                  navigate('/auth/login?reset=success', { replace: true });
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to reset password');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

