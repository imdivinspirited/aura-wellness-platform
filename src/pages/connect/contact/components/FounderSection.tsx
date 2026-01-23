import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FounderInfo } from '../data';

interface FounderSectionProps {
  founder: FounderInfo;
}

export const FounderSection = ({ founder }: FounderSectionProps) => {
  return (
    <section className="py-12" aria-labelledby="founder-heading">
      <Card className="border-stone-200 shadow-sm bg-gradient-to-br from-stone-50/50 to-primary/5">
        <CardContent className="p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2
              id="founder-heading"
              className="font-display text-3xl md:text-4xl font-light mb-4 text-stone-900"
            >
              {founder.name}
            </h2>
            <p className="text-lg text-primary font-medium mb-6">{founder.title}</p>
            <p className="text-stone-700 leading-relaxed mb-8 max-w-2xl mx-auto">
              {founder.description}
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-stone-700 text-stone-700 hover:bg-stone-700 hover:text-white font-light"
              aria-label="Learn more about Gurudev Sri Sri Ravi Shankar"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
};
