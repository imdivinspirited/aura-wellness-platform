/**
 * Shared Program Testimonials Component
 *
 * Reusable testimonials carousel for all program pages.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '../types';

interface ProgramTestimonialsProps {
  testimonials: Testimonial[];
  title?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export const ProgramTestimonials = ({
  testimonials,
  title = 'What Participants Say',
  autoRotate = true,
  rotateInterval = 5000,
}: ProgramTestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 bg-stone-50/30" aria-labelledby="testimonials-heading">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2
            id="testimonials-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
          >
            {title}
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-stone-200 shadow-sm">
                <CardContent className="p-8 md:p-12">
                  <Quote className="h-10 w-10 text-green-600 mb-6" />
                  <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-stone-800">
                    "{current.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {current.photo ? (
                        <AvatarImage src={current.photo} alt={current.name} />
                      ) : null}
                      <AvatarFallback className="bg-green-50 text-green-700 text-xl">
                        {current.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-stone-900">{current.name}</p>
                      {current.age && (
                        <p className="text-sm text-stone-600">Age {current.age}</p>
                      )}
                      {current.role && (
                        <p className="text-sm text-stone-600">{current.role}</p>
                      )}
                      {current.location && (
                        <p className="text-sm text-stone-500">{current.location}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex ? 'w-8 bg-green-600' : 'w-2 bg-stone-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
