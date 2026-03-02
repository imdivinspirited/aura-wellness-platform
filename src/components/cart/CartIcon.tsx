/**
 * Cart Icon Component
 *
 * Displays cart icon with badge count in header.
 */

import { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { CartDrawer } from './CartDrawer';
import { useState } from 'react';

export function CartIcon() {
  const { itemCount, initialize } = useCartStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
      <CartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
