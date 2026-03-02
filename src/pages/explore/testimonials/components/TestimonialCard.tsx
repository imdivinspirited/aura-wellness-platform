/**
 * Testimonials - Testimonial Card
 *
 * Card component for text and video testimonials.
 */

import { useState } from 'react';
import { Quote, MapPin, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '../../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const [showFullStory, setShowFullStory] = useState(false);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {testimonial.type === 'video' && testimonial.thumbnail && (
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden group cursor-pointer">
            <img
              src={testimonial.thumbnail}
              alt={testimonial.author.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="bg-primary rounded-full p-4 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        <Quote className="h-8 w-8 text-primary/30 mb-4" />
        <blockquote className="text-lg font-medium leading-relaxed mb-4 text-foreground">
          "{testimonial.quote}"
        </blockquote>

        {testimonial.fullStory && (
          <div className="mb-4">
            {showFullStory ? (
              <p className="text-muted-foreground leading-relaxed">{testimonial.fullStory}</p>
            ) : (
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {testimonial.fullStory}
              </p>
            )}
            {testimonial.fullStory.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullStory(!showFullStory)}
                className="mt-2"
              >
                {showFullStory ? (
                  <>
                    Show Less
                    <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read More
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <Avatar className="h-12 w-12">
            <AvatarImage src={testimonial.author.photo} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {testimonial.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{testimonial.author.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {testimonial.author.role && <span className="truncate">{testimonial.author.role}</span>}
              {testimonial.author.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{testimonial.author.country}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
            {testimonial.category.name}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
