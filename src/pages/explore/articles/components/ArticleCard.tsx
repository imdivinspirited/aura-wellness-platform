/**
 * Articles & Blogs - Article Card
 *
 * Reusable article card component.
 */

import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard = ({ article, featured = false }: ArticleCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-48">
        <SafeImage
          category="explore"
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary">{article.category.name}</Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className={`font-display font-bold mb-3 line-clamp-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
          {article.title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={article.author.avatar} />
              <AvatarFallback className="text-xs">{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{article.author.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link to={`/explore/articles/${article.slug}`}>
            Read More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
