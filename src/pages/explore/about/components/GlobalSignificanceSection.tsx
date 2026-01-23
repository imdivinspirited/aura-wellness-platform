/**
 * About the Ashram - Global Significance Section
 *
 * Statistics and impact visualization.
 */

import { motion } from 'framer-motion';
import { Globe, Users, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { AshramStatistic } from '../../types';

interface GlobalSignificanceSectionProps {
  statistics: AshramStatistic[];
}

const statIcons: Record<AshramStatistic['category'], typeof Globe> = {
  visitors: Users,
  countries: Globe,
  programs: Calendar,
  years: TrendingUp,
};

export const GlobalSignificanceSection = ({ statistics }: GlobalSignificanceSectionProps) => {
  const formatValue = (value: number, unit?: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit || ''}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Global Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A center that has touched millions of lives across the globe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => {
            const IconComponent = statIcons[stat.category];

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="text-4xl md:text-5xl font-bold text-primary mb-2"
                    >
                      {formatValue(stat.value, stat.unit)}
                    </motion.div>
                    <p className="text-muted-foreground font-medium">{stat.label}</p>
                    {stat.trend && (
                      <div className="mt-2">
                        <TrendingUp
                          className={`h-4 w-4 mx-auto ${
                            stat.trend === 'up' ? 'text-green-600' : 'text-muted-foreground'
                          }`}
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
