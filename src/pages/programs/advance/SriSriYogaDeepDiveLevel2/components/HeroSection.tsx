import { motion } from 'framer-motion';
import { Calendar, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-ashram.jpg';
import type { ProgramData } from '../data';

interface HeroSectionProps {
  data: ProgramData;
  onRegister: () => void;
}

export const HeroSection = ({ data, onRegister }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Yoga practice space"
          className="h-full w-full object-cover opacity-8"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-amber-50/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-light mb-6 leading-tight text-stone-800"
          >
            {data.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-stone-700 mb-4 font-light leading-relaxed max-w-3xl mx-auto"
          >
            {data.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto"
          >
            {data.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-stone-600"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{data.format}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>{data.contributionDisclaimer}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-stone-700 text-amber-50 hover:bg-stone-600 font-light tracking-wide"
              aria-label="Sign up for Sri Sri Yoga Deep Dive Level 2"
            >
              Sign me up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
