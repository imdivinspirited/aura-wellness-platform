/**
 * Shopping - Category Filters
 *
 * Filter shops by category.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ShopCategory } from '../../types';

interface ShopCategoriesProps {
  categories: Array<{ id: ShopCategory; name: string; count: number }>;
  selectedCategory: ShopCategory | 'all';
  onCategoryChange: (category: ShopCategory | 'all') => void;
}

export const ShopCategories = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: ShopCategoriesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategoryChange('all')}
      >
        All Shops
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
        >
          {category.name}
          <Badge variant="secondary" className="ml-2">
            {category.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
