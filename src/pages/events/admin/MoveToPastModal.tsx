import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { verifyAdminPassword, logAdminAction } from './adminAuth';
import type { Event } from '../types';

interface MoveToPastModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (eventId: string, reason?: string) => Promise<void>;
}

/**
 * Move to Past Event Modal
 *
 * Secure modal for admin-only action to move an event to past category.
 *
 * Security Features:
 * - Password authentication
 * - Rate limiting
 * - Audit logging
 * - CSRF protection ready
 */
export const MoveToPastModal = ({
  event,
  isOpen,
  onClose,
  onConfirm,
}: MoveToPastModalProps) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);

    try {
      const verifiedAdminId = await verifyAdminPassword(password);

      if (verifiedAdminId) {
        setIsAuthenticated(true);
        setAdminId(verifiedAdminId);
        setError(null);
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
      );
      setPassword('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleConfirm = async () => {
    if (!adminId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Log admin action
      logAdminAction(adminId, 'move-to-past', event.id, {
        eventTitle: event.title,
        reason: reason || 'No reason provided',
        previousCategory: event.category,
      });

      // Call the confirm handler
      await onConfirm(event.id, reason);

      // Close modal after successful operation
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to move event. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setPassword('');
    setReason('');
    setError(null);
    setIsAuthenticated(false);
    setAdminId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Admin: Move Event to Past
          </DialogTitle>
          <DialogDescription id="modal-description">
            This action will move "{event.title}" to the Past Events category.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Admin authentication required. This action will be logged.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    disabled={isAuthenticating}
                    autoFocus
                    aria-label="Admin password"
                    aria-describedby="password-help"
                  />
                  <p id="password-help" className="text-xs text-muted-foreground">
                    Enter your admin password to continue
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAuthenticating || !password}>
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Authenticate'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  Authentication successful. You can now proceed.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why are you moving this event to past? (Optional)"
                  rows={3}
                  aria-label="Reason for moving event"
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be logged in the audit trail
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-lg space-y-2">
                <p className="text-sm font-medium">Event Details:</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Title:</strong> {event.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Current Category:</strong> {event.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>New Category:</strong> past
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="bg-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Moving...
                    </>
                  ) : (
                    'Confirm Move to Past'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
