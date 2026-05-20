/**
 * Cart — custom tote glyph (no background box).
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { CartDrawer } from './CartDrawer';
import { headerToolbarIconButtonClass } from '@/components/ui/headerToolbarIcon';
import { ToolbarCartGlyph } from '@/components/icons/ToolbarGlyphSet';

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
        className={headerToolbarIconButtonClass}
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <ToolbarCartGlyph />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-0.5 -top-0.5 z-[2] flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full p-0 px-1 text-[10px] font-semibold tabular-nums"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
      <CartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
