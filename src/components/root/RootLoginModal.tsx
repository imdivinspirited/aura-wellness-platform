/**
 * Root Login Modal
 *
 * Secure modal for root user authentication.
 * Only visible when not authenticated.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { authenticateRootUser } from '@/lib/root/auth';
import { useRootStore } from '@/stores/rootStore';

interface RootLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RootLoginModal({ open, onOpenChange }: RootLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activateRootMode } = useRootStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authenticateRootUser(username, password);

      if (result.success && result.session) {
        // Activate root mode
        activateRootMode();
        // Close modal
        onOpenChange(false);
        // Clear form
        setUsername('');
        setPassword('');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('[Root Login] Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Login as Root
          </DialogTitle>
          <DialogDescription>
            Enter your root credentials to enable content editing mode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="root-username">Username</Label>
            <Input
              id="root-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="rootadmin1"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="root-password">Password</Label>
            <Input
              id="root-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>⚠️ Root access provides full content editing capabilities.</p>
          <p>All actions are logged and audited.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
