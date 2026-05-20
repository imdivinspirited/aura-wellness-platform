import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Shield, Globe, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';

const trustBadges = [
  { icon: Globe, label: '180+ Countries' },
  { icon: Shield, label: 'UN Consultative Status' },
  { icon: Award, label: '500M+ Lives Touched' },
  { icon: Star, label: '40+ Years Legacy' },
];

export function IntlHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToQuiz = () => {
    document.getElementById('personalization-quiz')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToExperiences = () => {
    document.getElementById('signature-experiences')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <img
          src="/images/hero/hero_international.jpg"
          alt="Art of Living Bangalore Ashram at sunrise"
          className="h-full w-full object-cover scale-110"
          loading="eager"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20" />
      </motion.div>

      {/* Content */}
      <motion.div className="relative z-10 container py-20" style={{ opacity }}>
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary-foreground">Your First Time in India?  We've Got You</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-primary-foreground"
          >
            Discover Inner Peace
            <br />
            <span className="text-gradient-gold">in the Heart of India</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl"
          >
            Join thousands of international visitors at the Art of Living Bangalore Ashram.
            Experience transformative meditation, yoga, and breathwork in a world-class wellness retreat.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
              onClick={scrollToQuiz}
            >
              Find Your Perfect Retreat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={scrollToExperiences}
            >
              <Play className="mr-2 h-5 w-5" />
              Explore Experiences
            </Button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-6"
          >
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-primary-foreground/70">
                <badge.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
