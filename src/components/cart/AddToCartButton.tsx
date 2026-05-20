/**
 * Add to Cart Button Component
 *
 * Universal, reusable component for adding any item to cart.
 * Automatically handles all item types.
 */

import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { LoginModal } from '@/components/auth/LoginModal';
import type { CartItemType } from '@/lib/cart/types';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  itemId: string;
  itemType: CartItemType;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  price?: number;
  metadata?: Record<string, unknown>;
  registrationUrl?: string;
  variant?: 'default' | 'icon' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function AddToCartButton({
  itemId,
  itemType,
  title,
  subtitle,
  thumbnail,
  price,
  metadata,
  registrationUrl,
  variant = 'default',
  size = 'default',
  className,
  showLabel = true,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem, cart } = useCartStore();
  const { isAuthenticated, ensureAnonymous } = useAuthStore();

  // Check if item is already in cart
  const isInCart = cart?.items.some(
    item => item.itemId === itemId && item.itemType === itemType
  ) || false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart || isAdding) return;

    // Ensure anonymous ID for guest users
    if (!isAuthenticated) {
      try {
        await ensureAnonymous();
      } catch (error) {
        console.warn('Failed to ensure anonymous ID:', error);
      }
    }

    setIsAdding(true);
    try {
      await addItem({
        itemId,
        itemType,
        title,
        subtitle,
        thumbnail,
        price,
        metadata,
        registrationUrl,
        quantity: 1,
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.warn('Failed to add item to cart', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddToCart}
          disabled={isAdding || isInCart}
          className={cn('relative', className)}
          aria-label={isInCart ? 'Already in cart' : 'Add to cart'}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isAdded || isInCart ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={handleAddToCart}
          disabled={isAdding || isInCart}
          className={cn(className)}
        >
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {showLabel && 'Adding...'}
            </>
          ) : isAdded || isInCart ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {showLabel && (isInCart ? 'In Cart' : 'Added!')}
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {showLabel && 'Add to Cart'}
            </>
          )}
        </Button>
      )}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          setShowLoginModal(false);
          handleAddToCart({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
        }}
      />
    </>
  );
}
