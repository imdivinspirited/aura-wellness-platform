import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Testimonial } from '../data';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export const TestimonialsCarousel = ({ testimonials }: TestimonialsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-24 bg-white" aria-labelledby="testimonials-heading">
      <div className="container">
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
            Participant Testimonials
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto">
            Hear from those who have experienced the transformation
          </p>
        </motion.div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border border-stone-200 shadow-none bg-white">
                <CardContent className="p-6">
                  <Quote className="h-6 w-6 text-primary/30 mb-4" aria-hidden="true" />
                  <blockquote className="text-stone-700 mb-6 leading-relaxed italic text-sm">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-green-50 text-green-700 font-medium">
                          {testimonial.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">{testimonial.name}</p>
                        <p className="text-xs text-stone-600">{testimonial.role}</p>
                      </div>
                    </div>
                    {testimonial.age && (
                      <p className="text-xs text-stone-500 mt-1">Age {testimonial.age}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden relative max-w-2xl mx-auto">
          <div className="overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-stone-200 shadow-none bg-white">
                  <CardContent className="p-6">
                    <Quote className="h-6 w-6 text-primary/30 mb-4" aria-hidden="true" />
                    <blockquote className="text-stone-700 mb-6 leading-relaxed italic">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>
                    <div className="pt-4 border-t border-stone-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-green-50 text-green-700 font-medium">
                            {testimonials[currentIndex].name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-stone-900">{testimonials[currentIndex].name}</p>
                          <p className="text-sm text-stone-600">{testimonials[currentIndex].role}</p>
                        </div>
                      </div>
                      {testimonials[currentIndex].age && (
                        <p className="text-xs text-stone-500 mt-1">Age {testimonials[currentIndex].age}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToTestimonial(i)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-primary w-8' : 'bg-stone-300'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
