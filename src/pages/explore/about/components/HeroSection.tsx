/**
 * About the Ashram - Hero Section
 *
 * Emotion-driven hero section introducing the ashram.
 */

import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { AboutAshramPageData } from '../../types';

interface HeroSectionProps {
  data: AboutAshramPageData['hero'];
}

export const HeroSection = ({ data }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.image}
          alt="Art of Living International Center"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-white"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            {data.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/90 mb-8 font-light leading-relaxed max-w-3xl mx-auto"
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <Link to={data.ctaLink}>
                {data.ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Link to="/explore/mission">
                <MapPin className="mr-2 h-4 w-4" />
                Our Mission
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
