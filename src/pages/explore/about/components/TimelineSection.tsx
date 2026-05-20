/**
 * About the Ashram - Timeline Section
 *
 * Scalable timeline component showing ashram history.
 */

import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TimelineEvent } from '../../types';

interface TimelineSectionProps {
  events: TimelineEvent[];
}

export const TimelineSection = ({ events }: TimelineSectionProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A timeline of milestones that shaped the ashram into a global center for peace and transformation
          </p>
        </div>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2" />

          {/* Timeline Events */}
          <div className="space-y-12">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background transform md:-translate-x-1/2 z-10" />

                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'} ml-16 md:ml-0`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="font-bold text-2xl text-primary">{event.year}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-3">{event.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                      {event.significance && (
                        <div className="flex items-start gap-2 pt-4 border-t">
                          <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground italic">{event.significance}</p>
                        </div>
                      )}
                      {event.image && (
                        <div className="mt-4 rounded-lg overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
