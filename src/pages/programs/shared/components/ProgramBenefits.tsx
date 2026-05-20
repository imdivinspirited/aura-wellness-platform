/**
 * Shared Program Benefits Component
 *
 * Reusable benefits grid for all program pages.
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { Benefit } from '../types';
import * as Icons from 'lucide-react';

interface ProgramBenefitsProps {
  benefits: Benefit[];
  title?: string;
  subtitle?: string;
}

export const ProgramBenefits = ({
  benefits,
  title = 'Program Benefits',
  subtitle
}: ProgramBenefitsProps) => {
  return (
    <section className="py-24 bg-stone-50/50" aria-labelledby="benefits-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <h2
            id="benefits-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-stone-900"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((benefit, i) => {
                const IconComponent =
                  (Icons as unknown as Record<string, React.ComponentType<any>>)[benefit.icon] ||
                  Icons.Heart;

            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-green-700" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-light mb-1 text-stone-900">{benefit.title}</h3>
                        {benefit.subtitle && (
                          <p className="text-xs text-green-700 font-medium mb-2">{benefit.subtitle}</p>
                        )}
                        <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
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
