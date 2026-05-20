/**
 * Testimonials - Testimonial Grid
 *
 * Responsive grid layout for testimonials.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TestimonialCard } from './TestimonialCard';
import type { Testimonial } from '../../types';

interface TestimonialGridProps {
  testimonials: Testimonial[];
}

const TESTIMONIALS_PER_PAGE = 9;

export const TestimonialGrid = ({ testimonials }: TestimonialGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination
  const totalPages = Math.ceil(testimonials.length / TESTIMONIALS_PER_PAGE);
  const paginatedTestimonials = testimonials.slice(
    (currentPage - 1) * TESTIMONIALS_PER_PAGE,
    currentPage * TESTIMONIALS_PER_PAGE
  );

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">No testimonials found</p>
        <p className="text-sm text-muted-foreground">
          Try selecting a different category
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedTestimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <TestimonialCard testimonial={testimonial} />
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
