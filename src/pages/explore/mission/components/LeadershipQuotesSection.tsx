/**
 * Mission & Vision - Leadership Quotes Section
 *
 * Carousel of inspirational quotes.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LeadershipQuote } from '../../types';

interface LeadershipQuotesSectionProps {
  quotes: LeadershipQuote[];
}

export const LeadershipQuotesSection = ({ quotes }: LeadershipQuotesSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  if (quotes.length === 0) return null;

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Words of Wisdom
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inspiring insights from our leadership
          </p>
        </div>

        <div className="relative">
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
                  <Quote className="h-12 w-12 text-primary/30 mb-6" />
                  <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 text-foreground">
                    "{quotes[currentIndex].text}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={quotes[currentIndex].author.avatar} alt={quotes[currentIndex].author.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {quotes[currentIndex].author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{quotes[currentIndex].author.name}</p>
                      <p className="text-muted-foreground">{quotes[currentIndex].author.role}</p>
                      {quotes[currentIndex].context && (
                        <p className="text-sm text-muted-foreground mt-1 italic">{quotes[currentIndex].context}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevQuote}
              aria-label="Previous quote"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextQuote}
              aria-label="Next quote"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
