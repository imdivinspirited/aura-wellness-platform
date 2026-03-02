/**
 * Mission & Vision - Impact Statistics Section
 *
 * Animated counters showing global impact.
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Globe, Users, Calendar, TreePine, GraduationCap, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ImpactStat } from '../../types';

interface ImpactStatsSectionProps {
  stats: ImpactStat[];
}

const statIcons: Record<string, typeof Globe> = {
  'People Reached': Users,
  'Countries': Globe,
  'Programs': Calendar,
  'Trees Planted': TreePine,
  'Schools': GraduationCap,
  'Volunteers': Heart,
};

export const ImpactStatsSection = ({ stats }: ImpactStatsSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Global Impact
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Numbers that reflect our commitment to transforming lives worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = statIcons[stat.category] || Globe;

            return (
              <AnimatedStatCard key={stat.id} stat={stat} index={index} IconComponent={IconComponent} />
            );
          })}
        </div>
      </div>
    </section>
  );
};

function AnimatedStatCard({
  stat,
  index,
  IconComponent,
}: {
  stat: ImpactStat;
  index: number;
  IconComponent: typeof Globe;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const formatValue = (value: number, unit?: string) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B${unit || ''}`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit || ''}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        setCount(stat.value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
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
            <div className="flex-1">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                {formatValue(count, stat.unit)}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
            {stat.trend === 'up' && (
              <TrendingUp className="h-5 w-5 text-green-600" />
            )}
          </div>
          {stat.description && (
            <p className="text-sm text-muted-foreground mt-4">{stat.description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
