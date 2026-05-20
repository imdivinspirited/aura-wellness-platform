import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-ashram.jpg';
import type { ProgramData } from '../data';

interface FounderSectionProps {
  data: ProgramData;
}

export const FounderSection = ({ data }: FounderSectionProps) => {
  return (
    <section
      className="relative py-32 overflow-hidden bg-gradient-to-br from-green-50/30 via-amber-50/20 to-stone-50/30"
      aria-labelledby="founder-heading"
    >
      {/* Background Image */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-green-50/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2
              id="founder-heading"
              className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-stone-900"
            >
              {data.founder.name}
            </h2>
            <p className="text-lg md:text-xl text-stone-700 mb-4 font-medium">{data.founder.title}</p>
            <p className="text-lg md:text-xl text-stone-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              {data.founder.description}
            </p>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-2 border-stone-700 text-stone-700 hover:bg-stone-700 hover:text-white font-light"
              aria-label="Learn more about Gurudev Sri Sri Ravi Shankar"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
