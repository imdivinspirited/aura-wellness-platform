/**
 * Shopping Page
 *
 * Comprehensive shopping information with all shops, products, and details.
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ShopCard } from './components/ShopCard';
import { ShopCategories } from './components/ShopCategories';
import { shoppingData } from './data';
import type { ShopCategory } from '../types';

const ShoppingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');

  // Calculate category counts
  const categories = useMemo(() => {
    const counts: Record<ShopCategory, number> = {
      bookstore: 0,
      ayurveda: 0,
      souvenirs: 0,
      clothing: 0,
      spiritual: 0,
      other: 0,
    };

    shoppingData.shops.forEach((shop) => {
      counts[shop.category]++;
    });

    return [
      { id: 'bookstore' as ShopCategory, name: 'Bookstore', count: counts.bookstore },
      { id: 'ayurveda' as ShopCategory, name: 'Ayurveda & Wellness', count: counts.ayurveda },
      { id: 'souvenirs' as ShopCategory, name: 'Souvenirs & Gifts', count: counts.souvenirs },
      { id: 'clothing' as ShopCategory, name: 'Clothing', count: counts.clothing },
      { id: 'spiritual' as ShopCategory, name: 'Spiritual Items', count: counts.spiritual },
    ].filter((cat) => cat.count > 0);
  }, []);

  // Filter shops by category
  const filteredShops = useMemo(() => {
    if (selectedCategory === 'all') {
      return shoppingData.shops;
    }
    return shoppingData.shops.filter((shop) => shop.category === selectedCategory);
  }, [selectedCategory]);

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
        <ShopCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Shops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
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
