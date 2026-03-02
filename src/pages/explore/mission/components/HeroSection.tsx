/**
 * Mission & Vision - Hero Section
 *
 * Minimalist hero with vision statement.
 */

import { motion } from 'framer-motion';
import type { MissionVisionPageData } from '../../types';

interface HeroSectionProps {
  data: MissionVisionPageData['hero'];
}

export const HeroSection = ({ data }: HeroSectionProps) => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground"
          >
            {data.visionStatement}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground font-light"
          >
            {data.subtitle}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
