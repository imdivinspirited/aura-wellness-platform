/**
 * Videos & Talks Page
 *
 * Multimedia learning hub with categories and search.
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { FeaturedVideoSection } from './components/FeaturedVideoSection';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchBar } from './components/SearchBar';
import { VideoGrid } from './components/VideoGrid';
import { videosData } from './data';

const VideosPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter videos by category
  const filteredVideos = useMemo(() => {
    let filtered = videosData.videos;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((video) => video.category.id === selectedCategory);
    }

    return filtered;
  }, [selectedCategory]);

  const featuredVideo = videosData.featured[0];

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Videos & Talks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore wisdom talks, guided meditations, event recordings, and inspiring discourses
          </p>
        </div>

        {/* Featured Video */}
        {featuredVideo && <FeaturedVideoSection video={featuredVideo} />}

        {/* Search & Filters */}
        <div className="mt-12">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryTabs
            categories={videosData.categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Video Grid */}
        <VideoGrid videos={filteredVideos} searchQuery={searchQuery} />
      </div>
    </MainLayout>
  );
};

export default VideosPage;
