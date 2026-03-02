/**
 * Cart Drawer Component
 *
 * Side drawer showing cart contents with edit/remove options.
 */
import { useState } from 'react';
import { X, Trash2, Plus, Minus, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem } from '@/lib/cart/types';
// import { formatDistanceToNow } from 'date-fns'; // Optional: for "added X ago" display

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isProceeding, setIsProceeding] = useState(false);

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity);
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleProceed = () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const withRegistration = cart.items.find(item => item.registrationUrl);
    if (!withRegistration?.registrationUrl) {
      alert('No registration link is configured for items in your cart.');
      return;
    }

    setIsProceeding(true);
    // Global rule: same-tab by default
    window.location.href = withRegistration.registrationUrl;
  };

  const getItemTypeLabel = (type: CartItem['itemType']): string => {
    const labels: Record<CartItem['itemType'], string> = {
      program: 'Program',
      service: 'Service',
      pass: 'Pass',
      course: 'Course',
      facility: 'Facility',
      booking: 'Booking',
      application: 'Application',
      retreat: 'Retreat',
    };
    return labels[type] || 'Item';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {cart?.items.length || 0} {cart?.items.length === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Continue Browsing
              </Button>
            </div>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.itemId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {getItemTypeLabel(item.itemType)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
                      )}
                      {item.metadata && (
                        <div className="mt-2 space-y-1">
                          {item.metadata.dates && (
                            <p className="text-xs text-muted-foreground">
                              Date: {String(item.metadata.dates)}
                            </p>
                          )}
                          {item.metadata.location && (
                            <p className="text-xs text-muted-foreground">
                              Location: {String(item.metadata.location)}
                            </p>
                          )}
                          {item.metadata.duration && (
                            <p className="text-xs text-muted-foreground">
                              Duration: {String(item.metadata.duration)}
                            </p>
                          )}
                        </div>
                      )}
                      {item.price && (
                        <p className="text-sm font-medium mt-1">
                          ₹{item.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemove(item.itemId)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {item.registrationUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Global rule: same-tab by default
                          window.location.href = item.registrationUrl;
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  className="w-full bg-blue-700 hover:bg-blue-600"
                  onClick={handleProceed}
                  disabled={isProceeding}
                >
                  {isProceeding ? 'Proceeding…' : 'Proceed to Registration'}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
