import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { Benefit } from '../data';
import * as Icons from 'lucide-react';

interface ProgramHighlightsProps {
  benefits: Benefit[];
}

export const ProgramHighlights = ({ benefits }: ProgramHighlightsProps) => {
  // Get the first 3 benefits (main highlights)
  const mainBenefits = benefits.slice(0, 3);

  return (
    <section className="py-24 bg-white" aria-labelledby="highlights-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <h2
            id="highlights-heading"
            className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-stone-900"
          >
            What will I get from this workshop?
          </h2>
          <p className="text-lg text-stone-700 leading-relaxed">
            This advanced program offers transformative benefits through deep yogic practice and wisdom.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {mainBenefits.map((benefit, i) => {
            // Dynamically get icon component with fallback
            const IconComponent =
              (Icons as unknown as Record<string, React.ComponentType<any>>)[benefit.icon] ||
              Icons.Heart ||
              Icons.Circle;

            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-stone-200 shadow-none hover:shadow-sm bg-white transition-all">
                  <CardContent className="p-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
                      <IconComponent className="h-8 w-8 text-green-700" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-light mb-2 text-stone-900">{benefit.title}</h3>
                    <p className="text-sm text-green-700 font-medium mb-4">{benefit.subtitle}</p>
                    <p className="text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
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
