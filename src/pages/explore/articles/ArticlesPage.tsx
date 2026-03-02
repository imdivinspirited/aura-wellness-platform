/**
 * Articles & Blogs Page
 *
 * Knowledge hub with search, filters, and pagination.
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FeaturedSection } from './components/FeaturedSection';
import { CategoryFilters } from './components/CategoryFilters';
import { TagCloud } from './components/TagCloud';
import { SearchBar } from './components/SearchBar';
import { ArticleGrid } from './components/ArticleGrid';
import { articlesData } from './data';

const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter articles by category and tags
  const filteredArticles = useMemo(() => {
    let filtered = articlesData.articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((article) => article.category.id === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((article) =>
        article.tags.some((tag) => selectedTags.includes(tag.id))
      );
    }

    return filtered;
  }, [selectedCategory, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Articles & Blogs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore wisdom, wellness insights, inspiring stories, and event coverage
          </p>
        </div>

        {/* Featured Section */}
        <FeaturedSection featured={articlesData.featured} />

        {/* Search & Filters */}
        <div className="mt-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilters
            categories={articlesData.categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <TagCloud
            tags={articlesData.tags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </div>

        {/* Article Grid */}
        <ArticleGrid articles={filteredArticles} searchQuery={searchQuery} />
      </div>
    </MainLayout>
  );
};

export default ArticlesPage;
