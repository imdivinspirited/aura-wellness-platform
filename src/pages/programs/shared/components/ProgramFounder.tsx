/**
 * Shared Program Founder Component
 *
 * Reusable founder section for all program pages.
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { ProgramData } from '../types';

interface ProgramFounderProps {
  founder: ProgramData['founder'];
  title?: string;
}

export const ProgramFounder = ({
  founder,
  title = 'About the Founder'
}: ProgramFounderProps) => {
  return (
    <section className="py-24 bg-white" aria-labelledby="founder-heading">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2
            id="founder-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
          >
            {title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl md:text-3xl font-light mb-2 text-stone-900">
                  {founder.name}
                </h3>
                <p className="text-lg text-green-700 font-medium mb-4">{founder.title}</p>
              </div>
              <p className="text-stone-700 leading-relaxed text-center max-w-3xl mx-auto">
                {founder.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
