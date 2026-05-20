/**
 * Mission & Vision - Mission Pillars Section
 *
 * Grid layout showing core mission pillars.
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { MissionPillar } from '../../types';
import * as Icons from 'lucide-react';

interface MissionPillarsSectionProps {
  pillars: MissionPillar[];
}

export const MissionPillarsSection = ({ pillars }: MissionPillarsSectionProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Mission Pillars
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Six foundational pillars that guide our work and shape our impact
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const IconComponent = Icons[pillar.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold">{pillar.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
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
