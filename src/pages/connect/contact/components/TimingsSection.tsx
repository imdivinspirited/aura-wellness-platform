import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Timing } from '../data';

interface TimingsSectionProps {
  timings: Timing[];
}

export const TimingsSection = ({ timings }: TimingsSectionProps) => {
  return (
    <section className="py-12" aria-labelledby="timings-heading">
      <h2 id="timings-heading" className="font-display text-3xl font-light mb-6 text-stone-900">
        Timings
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {timings.map((timing, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-stone-200 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-light mb-2 text-stone-900">
                      {timing.location}
                    </h3>
                    <div className="flex items-center gap-2 text-stone-700 mb-2">
                      <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="font-medium">{timing.timings}</span>
                    </div>
                    {timing.notes && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {timing.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
