import { motion } from 'framer-motion';
import { Calendar, Heart, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ProgramData } from '../data';

interface WorkshopDetailsProps {
  data: ProgramData;
}

export const WorkshopDetails = ({ data }: WorkshopDetailsProps) => {
  return (
    <section className="py-24 bg-white" aria-labelledby="workshop-details-heading">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <h2
              id="workshop-details-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-8 text-stone-900"
            >
              Program Format
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="h-full border border-stone-200 shadow-none bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-amber-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-light text-stone-900">Residential Format</h3>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{data.format}</p>
                  <p className="text-sm text-stone-600 mt-4 leading-relaxed">
                    Immerse yourself fully in the practice with our residential program format,
                    allowing for deep transformation and complete focus on your journey.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border border-stone-200 shadow-none bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-light text-stone-900">Contribution</h3>
                  </div>
                  <p className="text-stone-700 leading-relaxed mb-4">{data.contributionDisclaimer}</p>
                  <div className="flex items-start gap-2 mt-4 p-4 bg-stone-50 rounded-lg">
                    <Info className="h-5 w-5 text-stone-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Your participation helps support social projects and makes these transformative programs
                      accessible to people from all walks of life.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
