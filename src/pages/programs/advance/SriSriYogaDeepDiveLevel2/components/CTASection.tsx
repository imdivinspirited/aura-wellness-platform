import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  onRegister: () => void;
}

export const CTASection = ({ onRegister }: CTASectionProps) => {
  return (
    <section className="py-24 bg-white border-t border-stone-200" aria-labelledby="cta-heading">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-8"
          >
            <h2
              id="cta-heading"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-stone-900"
            >
              Ready to Begin Your Deep Dive Journey?
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Join us for this transformative program and experience the profound benefits of advanced yogic practice.
            </p>
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
        </div>
      </div>
    </section>
  );
};
