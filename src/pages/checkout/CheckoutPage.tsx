import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/stores/cartStore';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { marketplaceCheckout } from '@/lib/api/orders';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const items = cart?.items || [];
  const productItems = items.filter((i) => i.itemType === 'product');

  const subtotal = useMemo(
    () => productItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    [productItems]
  );

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  });

  const checkoutM = useMutation({
    mutationFn: async () =>
      marketplaceCheckout({
        shippingAddress: {
          fullName: shipping.fullName,
          email: shipping.email || undefined,
          phone: shipping.phone || undefined,
          addressLine1: shipping.addressLine1,
          addressLine2: shipping.addressLine2 || undefined,
          city: shipping.city,
          state: shipping.state,
          country: shipping.country,
          postalCode: shipping.postalCode,
        },
        paymentProvider: 'manual',
      }),
    onSuccess: async () => {
      toast.success('Order created');
      // backend clears product items already; we clear local cart cache too
      await clearCart();
      window.location.href = '/orders';
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Checkout failed'),
  });

  return (
    <MainLayout>
      <div className="container py-10 max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-light">Checkout</h1>
            <p className="text-muted-foreground">Place your order using real marketplace data.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/services/shopping">Continue shopping</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>{productItems.length} product item(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {productItems.length === 0 ? (
              <p className="text-muted-foreground">No marketplace products in your cart.</p>
            ) : (
              productItems.map((i) => (
                <div key={`${i.itemType}:${i.itemId}`} className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{i.title}</div>
                    <div className="text-muted-foreground">Qty: {i.quantity}</div>
                  </div>
                  <div>₹{((i.price || 0) * i.quantity).toLocaleString()}</div>
                </div>
              ))
            )}
            <div className="pt-2 border-t flex justify-between font-medium">
              <div>Subtotal</div>
              <div>₹{subtotal.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
            <CardDescription>Used for order fulfillment records.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Full name</Label>
              <Input value={shipping.fullName} onChange={(e) => setShipping((p) => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={shipping.email} onChange={(e) => setShipping((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={shipping.phone} onChange={(e) => setShipping((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 1</Label>
              <Input value={shipping.addressLine1} onChange={(e) => setShipping((p) => ({ ...p, addressLine1: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address line 2</Label>
              <Input value={shipping.addressLine2} onChange={(e) => setShipping((p) => ({ ...p, addressLine2: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={shipping.city} onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={shipping.state} onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={shipping.country} onChange={(e) => setShipping((p) => ({ ...p, country: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Postal code</Label>
              <Input value={shipping.postalCode} onChange={(e) => setShipping((p) => ({ ...p, postalCode: e.target.value }))} />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-2">
              <Button
                onClick={() => checkoutM.mutate()}
                disabled={
                  checkoutM.isPending ||
                  productItems.length === 0 ||
                  !shipping.fullName ||
                  !shipping.addressLine1 ||
                  !shipping.city ||
                  !shipping.state ||
                  !shipping.country ||
                  !shipping.postalCode
                }
              >
                {checkoutM.isPending ? 'Placing…' : 'Place order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

