/**
 * Articles & Blogs - Category Filters
 *
 * Horizontal filter bar for article categories.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ArticleCategory } from '../../types';

interface CategoryFiltersProps {
  categories: ArticleCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          className="relative"
        >
          {category.name}
          {category.articleCount !== undefined && category.id !== 'all' && (
            <Badge variant="secondary" className="ml-2">
              {category.articleCount}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
