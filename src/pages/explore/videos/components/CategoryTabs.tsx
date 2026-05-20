/**
 * Videos & Talks - Category Tabs
 *
 * Tab navigation for video categories.
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VideoCategory } from '../../types';

interface CategoryTabsProps {
  categories: VideoCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryTabs = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'ghost'}
          onClick={() => onCategoryChange(category.id)}
          className="relative"
        >
          {category.name}
          {category.videoCount !== undefined && category.id !== 'all' && (
            <Badge variant="secondary" className="ml-2">
              {category.videoCount}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
