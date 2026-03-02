/**
 * Mission & Vision - Roadmap Section
 *
 * Future initiatives and vision.
 */

import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MissionVisionPageData } from '../../types';

interface RoadmapSectionProps {
  roadmap: MissionVisionPageData['roadmap'];
}

export const RoadmapSection = ({ roadmap }: RoadmapSectionProps) => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {roadmap.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {roadmap.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roadmap.initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl">{initiative.title}</CardTitle>
                    {initiative.timeline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-4 w-4" />
                        {initiative.timeline}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{initiative.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Join us in creating a better world for all
          </p>
          <motion.a
            href="/explore/about"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Learn More About Our Work
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
