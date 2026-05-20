/**
 * Articles & Blogs - Article Grid
 *
 * Responsive grid with pagination/infinite scroll.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../../types';

interface ArticleGridProps {
  articles: Article[];
  searchQuery?: string;
}

const ARTICLES_PER_PAGE = 12;

export const ArticleGrid = ({ articles, searchQuery }: ArticleGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter articles by search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return articles;
    }

    const query = searchQuery.toLowerCase().trim();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.name.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.name.toLowerCase().includes(query))
    );
  }, [articles, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">No articles found</p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <ArticleCard article={article} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
