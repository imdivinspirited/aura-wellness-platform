/**
 * About the Ashram - Daily Life Section
 *
 * Shows the daily routine and activities at the ashram.
 */

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DailyLifeActivity } from '../../types';
import * as Icons from 'lucide-react';

interface DailyLifeSectionProps {
  activities: DailyLifeActivity[];
}

export const DailyLifeSection = ({ activities }: DailyLifeSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Daily Life at the Ashram
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience a day in the life of the ashram, where every moment is an opportunity for growth and peace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon
              ? (Icons[activity.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)
              : Clock;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-primary">{activity.time}</span>
                        </div>
                        <h3 className="font-display text-xl font-bold mb-2">{activity.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{activity.description}</p>
                    {activity.image && (
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
