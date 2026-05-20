import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IntlFinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90" />
      <div className="absolute inset-0 opacity-10">
        <img
          src="/images/hero/hero_international.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="relative z-10 container max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
            Your Transformation
            <br />
            <span className="text-primary">Starts with One Step</span>
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Thousands of international visitors have walked this path. They came seeking peace and found a life-changing experience.
            The only question is: are you ready?
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
              onClick={() => window.open('https://programs.vvmvp.org/', '_blank')}
            >
              Book Your Retreat <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-base font-medium border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => window.open('https://wa.me/918067612345', '_blank')}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to Us on WhatsApp
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-sm text-primary-foreground/50">
            <span>🔒 Secure booking</span>
            <span>💳 All cards accepted</span>
            <span>📧 Instant confirmation</span>
            <span>🔄 Free cancellation (7 days)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
