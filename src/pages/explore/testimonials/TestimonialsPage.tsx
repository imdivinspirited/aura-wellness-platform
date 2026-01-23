/**
 * Testimonials Page
 *
 * Social proof and emotional trust building.
 */

import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from './components/HeroSection';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { CategoryFilters } from './components/CategoryFilters';
import { TestimonialGrid } from './components/TestimonialGrid';
import { ShareExperienceSection } from './components/ShareExperienceSection';
import { testimonialsData } from './data';

const TestimonialsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter testimonials by category
  const filteredTestimonials = useMemo(() => {
    if (selectedCategory === 'all') {
      return testimonialsData.testimonials.filter((t) => t.approved);
    }
    return testimonialsData.testimonials.filter(
      (t) => t.category.id === selectedCategory && t.approved
    );
  }, [selectedCategory]);

  const featuredTestimonials = testimonialsData.featured.filter((t) => t.approved);

  return (
    <MainLayout>
      <HeroSection />
      {featuredTestimonials.length > 0 && (
        <FeaturedCarousel testimonials={featuredTestimonials} />
      )}
      <div className="container py-12 max-w-7xl">
        {/* Category Filters */}
        <CategoryFilters
          categories={testimonialsData.categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Testimonial Grid */}
        <TestimonialGrid testimonials={filteredTestimonials} />
      </div>
      <ShareExperienceSection />
    </MainLayout>
  );
};

export default TestimonialsPage;
