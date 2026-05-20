import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { listMyOrders } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const ordersQ = useQuery({
    queryKey: ['me', 'orders'],
    queryFn: () => listMyOrders() as Promise<any>,
  });

  const orders = ordersQ.data?.data?.orders || [];

  return (
    <MainLayout>
      <div className="container py-10 max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-light">My Orders</h1>
            <p className="text-muted-foreground">Your marketplace orders (real DB-backed data).</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/services/shopping">Shop</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Latest first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              orders.map((o: any) => (
                <div key={o._id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-sm text-muted-foreground capitalize">{o.status}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {(o.currency || 'INR') === 'INR' ? '₹' : `${o.currency} `}
                    {(o.totalCents / 100).toFixed(2)}
                  </div>
                  <div className="text-sm">
                    Items: {(o.items || []).map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

