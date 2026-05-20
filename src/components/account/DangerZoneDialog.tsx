import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';

export function DangerZoneDialog({
  action,
  triggerLabel,
  title,
  description,
  confirmLabel,
}: {
  action: 'deactivate' | 'delete';
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
}) {
  const confirmPassword = useAuthStore((s) => s.confirmPassword);
  const deactivateAccount = useAuthStore((s) => s.deactivateAccount);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={action === 'delete' ? 'destructive' : 'outline'} className="w-full justify-start">
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="dz-password">Confirm your password</Label>
          <Input
            id="dz-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={action === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
            disabled={loading || password.length < 1}
            onClick={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                await confirmPassword(password);
                if (action === 'delete') {
                  await deleteAccount();
                } else {
                  await deactivateAccount();
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Action failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Working…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

