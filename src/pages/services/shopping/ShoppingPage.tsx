/**
 * Shopping Page
 *
 * Comprehensive shopping information with all shops, products, and details.
 */

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import type { ShopCategory } from '../types';
import { useQuery } from '@tanstack/react-query';
import { listMarketplaceProducts } from '@/lib/api/marketplace';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ShoppingPage = () => {
  const [_selectedCategory, _setSelectedCategory] = useState<ShopCategory | 'all'>('all');

  // Marketplace is DB-backed now; category filtering remains UI-only for now.
  const categories = useMemo(
    () => [
      { id: 'bookstore' as ShopCategory, name: 'Bookstore', count: 0 },
      { id: 'ayurveda' as ShopCategory, name: 'Ayurveda & Wellness', count: 0 },
      { id: 'souvenirs' as ShopCategory, name: 'Souvenirs & Gifts', count: 0 },
      { id: 'clothing' as ShopCategory, name: 'Clothing', count: 0 },
      { id: 'spiritual' as ShopCategory, name: 'Spiritual Items', count: 0 },
    ],
    []
  );

  const productsQ = useQuery({
    queryKey: ['marketplace', 'products'],
    queryFn: () => listMarketplaceProducts(),
  });

  const products = productsQ.data?.data?.products || [];

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shopping
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover books, spiritual items, ayurveda products, souvenirs, and more across our campus shops
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-6 text-sm text-muted-foreground">
          Category filter UI is coming next; products are already live from the database.
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {(p.currency || 'INR') === 'INR' ? '₹' : `${p.currency} `}
                    {(p.priceCents / 100).toFixed(2)}
                  </div>
                  <AddToCartButton
                    itemId={p._id}
                    itemType="product"
                    title={p.name}
                    subtitle={p.tags?.[0]}
                    thumbnail={p.images?.[0]}
                    price={Math.round(p.priceCents / 100)}
                    metadata={{ shopId: p.shopId, currency: p.currency, priceCents: p.priceCents }}
                  />
                </div>
                {p.stock <= 0 && <p className="text-xs text-destructive">Out of stock</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="font-display text-2xl font-bold mb-4">Shopping Information</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Payment Options</h3>
              <p>Most shops accept cash, card, and UPI payments. Some items may be available on a donation basis.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Special Services</h3>
              <p>Gift wrapping, bulk orders, and custom items can be arranged. Please inquire at individual shops.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShoppingPage;
