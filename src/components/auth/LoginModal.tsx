/**
 * Login Modal Component
 *
 * Modal for user login/registration.
 * Shown when authentication is required for cart/registration.
 */

import { useState } from 'react';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/** Matches backend registerSchema (authRoutes.js). */
const pwStrong = (p: string) =>
  p.length >= 10 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const { login, register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [need2fa, setNeed2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [registerSent, setRegisterSent] = useState(false);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({
        identifier: loginIdentifier,
        password: loginPassword,
        twoFactorCode: need2fa ? twoFactorCode : undefined,
      });
      onSuccess?.();
      onOpenChange(false);
      // Reset form
      setLoginIdentifier('');
      setLoginPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (String(msg).toLowerCase().includes('two-factor')) {
        setNeed2fa(true);
        setError('Two-factor code required. Enter the 6-digit code from your authenticator app.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
      setError('Please complete name, email, and password.');
      setIsLoading(false);
      return;
    }
    if (!pwStrong(registerPassword)) {
      setError(
        'Password must be at least 10 characters and include uppercase, lowercase, and a number.'
      );
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
        phone: registerPhone || undefined,
      });
      setRegisterSent(true);
      // Reset form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login or Register</DialogTitle>
          <DialogDescription>
            Create an account or login to continue
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-identifier">Email or Phone</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="your@email.com or +91 98765 43210"
                    className="pl-10"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {need2fa && (
                <div className="space-y-2">
                  <Label htmlFor="login-2fa">Two-factor code</Label>
                  <Input
                    id="login-2fa"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123 456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            {registerSent ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Verification link sent to <span className="font-medium text-foreground">{registerEmail}</span>.
                  Please open your email and click the link to finish creating your account.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setRegisterSent(false);
                    onOpenChange(false);
                    setRegisterName('');
                    setRegisterEmail('');
                    setRegisterPassword('');
                    setRegisterPhone('');
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    className="pl-10"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
