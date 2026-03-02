/**
 * Testimonials - Category Filters
 *
 * Filter buttons for testimonial categories.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TestimonialCategory } from '../../types';

interface CategoryFiltersProps {
  categories: TestimonialCategory[];
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
          {category.testimonialCount !== undefined && category.id !== 'all' && (
            <Badge variant="secondary" className="ml-2">
              {category.testimonialCount}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
