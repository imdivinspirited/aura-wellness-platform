/**
 * Shared Program Hero Component
 *
 * Reusable hero section for all program pages.
 */

import { motion } from 'framer-motion';
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-ashram.jpg';
import type { ProgramData } from '../types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface ProgramHeroProps {
  data: ProgramData;
  onRegister: () => void;
}

export const ProgramHero = ({ data, onRegister }: ProgramHeroProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Program background"
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
            className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-stone-800"
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
            {data.ageGroup && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Age: {data.ageGroup}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{data.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{data.format.charAt(0).toUpperCase() + data.format.slice(1)}</span>
            </div>
          </motion.div>

          {data.contributionDisclaimer && (
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-sm text-stone-500 mb-8 italic max-w-2xl mx-auto"
            >
              {data.contributionDisclaimer}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Button
              size="lg"
              onClick={onRegister}
              className="h-14 px-8 text-lg bg-stone-700 text-amber-50 hover:bg-stone-600 font-light tracking-wide"
              aria-label={`Register for ${data.title}`}
            >
              Register Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <AddToCartButton
              itemId={data.id}
              itemType="program"
              title={data.title}
              subtitle={data.subtitle}
              metadata={{
                duration: data.duration,
                format: data.format,
                ageGroup: data.ageGroup,
              }}
              registrationUrl={data.registrationUrl}
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
