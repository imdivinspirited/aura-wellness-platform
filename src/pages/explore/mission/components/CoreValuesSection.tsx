/**
 * Mission & Vision - Core Values Section
 *
 * Icon-driven value cards.
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { CoreValue } from '../../types';
import * as Icons from 'lucide-react';

interface CoreValuesSectionProps {
  values: CoreValue[];
}

export const CoreValuesSection = ({ values }: CoreValuesSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Core Values
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The principles that guide our actions and define our character
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const IconComponent = Icons[value.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow text-center">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3">{value.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
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
