/**
 * Articles & Blogs - Featured Section
 *
 * Large featured article with secondary featured articles.
 */

import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import type { Article } from '../../types';

interface FeaturedSectionProps {
  featured: Article[];
}

export const FeaturedSection = ({ featured }: FeaturedSectionProps) => {
  if (featured.length === 0) return null;

  const mainFeatured = featured[0];
  const secondaryFeatured = featured.slice(1, 3);

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full">
              <div className="relative h-64 md:h-96">
                <img
                  src={mainFeatured.featuredImage}
                  alt={mainFeatured.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <Badge className="mb-3 bg-primary">{mainFeatured.category.name}</Badge>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 line-clamp-2">
                    {mainFeatured.title}
                  </h2>
                  <p className="text-white/90 mb-4 line-clamp-2">{mainFeatured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={mainFeatured.author.avatar} />
                        <AvatarFallback className="text-xs">{mainFeatured.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{mainFeatured.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mainFeatured.readingTime} min read
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(mainFeatured.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to={`/explore/articles/${mainFeatured.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Secondary Featured Articles */}
          <div className="space-y-6">
            {secondaryFeatured.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <div className="relative h-32">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {article.category.name}
                    </Badge>
                    <h3 className="font-display text-lg font-bold mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.readingTime} min
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
