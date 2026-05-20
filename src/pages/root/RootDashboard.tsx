import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRootAuth } from '@/hooks/useRootAuth';
import { LayoutDashboard, LogOut, Pencil } from 'lucide-react';

export default function RootDashboard() {
  const { user, logout } = useRootAuth();

  return (
    <MainLayout>
      <div className="container py-10 max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Root dashboard
          </h1>
          <p className="text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Visual editor and admin tools</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/root/editor" className="gap-2">
                <Pencil className="h-4 w-4" />
                Open visual editor
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard">Admin analytics</Link>
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => {
                void logout();
                window.location.href = '/root/login';
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
