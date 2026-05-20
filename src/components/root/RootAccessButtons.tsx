import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, UserPlus } from 'lucide-react';

export function RootAccessButtons() {
  return (
    <div className="rounded-xl border border-border/80 bg-card/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Lock className="h-4 w-4" />
        Root Access
      </div>
      <p className="text-xs text-muted-foreground">
        Operator login for dashboard and visual editor. One root account per system.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="default" className="w-full sm:flex-1" asChild>
          <Link to="/root/login" className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign in as Root
          </Link>
        </Button>
        <Button variant="outline" className="w-full sm:flex-1" asChild>
          <Link to="/root/signup" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Sign up as Root
          </Link>
        </Button>
      </div>
    </div>
  );
}
