import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ProgramData } from '../data';

interface DeepDiveTechniquesProps {
  data: ProgramData;
}

export const DeepDiveTechniques = ({ data }: DeepDiveTechniquesProps) => {
  return (
    <section className="py-24 bg-stone-50/50" aria-labelledby="techniques-heading">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12"
          >
            <h2
              id="techniques-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-8 text-stone-900"
            >
              {data.deepDescription.title}
            </h2>
          </motion.div>

          <div className="space-y-8">
            {/* AMP Concept */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <Card className="border border-stone-200 shadow-none bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                    <h3 className="font-display text-2xl font-light text-stone-900">AMP Concept</h3>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{data.deepDescription.ampConcept}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Yogic Techniques */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-stone-200 shadow-none bg-white">
                <CardContent className="p-8">
                  <h3 className="font-display text-2xl font-light mb-6 text-stone-900">
                    Advanced Yogic Techniques
                  </h3>
                  <ul className="space-y-4">
                    {data.deepDescription.yogicTechniques.map((technique, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-stone-700 leading-relaxed">{technique}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
