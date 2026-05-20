/**
 * Articles & Blogs - Tag Cloud
 *
 * Popular tags with click-to-filter functionality.
 */

import { Badge } from '@/components/ui/badge';
import type { Tag } from '../../types';

interface TagCloudProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  maxTags?: number;
}

export const TagCloud = ({
  tags,
  selectedTags,
  onTagToggle,
  maxTags = 8,
}: TagCloudProps) => {
  // Sort by article count and take top tags
  const popularTags = [...tags]
    .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
    .slice(0, maxTags);

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => onTagToggle(tag.id)}
            >
              {tag.name}
              {tag.articleCount && (
                <span className="ml-1 text-xs opacity-70">({tag.articleCount})</span>
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
