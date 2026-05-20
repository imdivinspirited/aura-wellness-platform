/**
 * Testimonials - Featured Carousel
 *
 * Auto-rotating carousel of featured testimonials.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Play, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Testimonial } from '../../types';

interface FeaturedCarouselProps {
  testimonials: Testimonial[];
}

export const FeaturedCarousel = ({ testimonials }: FeaturedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Featured Stories
          </h2>
          <p className="text-muted-foreground">Inspiring transformations from our community</p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-primary/20">
                <CardContent className="p-8 md:p-12">
                  {current.type === 'video' && current.thumbnail && (
                    <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                      <img
                        src={current.thumbnail}
                        alt={current.author.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-4">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Quote className="h-10 w-10 text-primary/30 mb-4" />
                  <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-6 text-foreground">
                    "{current.quote}"
                  </blockquote>

                  {current.fullStory && (
                    <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                      {current.fullStory}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-6 border-t">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={current.author.photo} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {current.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{current.author.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {current.author.role && <span>{current.author.role}</span>}
                        {current.author.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {current.author.location}, {current.author.country}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{current.category.name}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-between items-center mt-6">
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
                      index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
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
