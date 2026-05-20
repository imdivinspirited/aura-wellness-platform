/**
 * Shared Program CTA Component
 *
 * Reusable call-to-action section for all program pages.
 */

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgramCTAProps {
  onRegister: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export const ProgramCTA = ({
  onRegister,
  title = 'Ready to Begin Your Journey?',
  subtitle = 'Join thousands who have transformed their lives through this program',
  buttonText = 'Register Now',
}: ProgramCTAProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-green-50/50 via-amber-50/30 to-stone-50/50">
      <div className="container max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-stone-900">
            {title}
          </h2>
          <p className="text-lg text-stone-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <Button
            size="lg"
            onClick={onRegister}
            className="h-14 px-8 text-lg bg-stone-700 text-amber-50 hover:bg-stone-600 font-light tracking-wide"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
