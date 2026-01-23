import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';

export const CTASection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetDirections = () => {
    window.open(ROUTES.GOOGLE_MAPS, '_blank', 'noopener,noreferrer');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      // In production, show success toast
    }, 1000);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hero-gradient opacity-50" />

      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-10 shadow-elevated"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Stay Connected
            </Badge>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Get Updates & Inspiration
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive updates on upcoming programs, events, and wisdom from Gurudev.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="h-12 px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </motion.div>

          {/* Visit Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Visit Us
            </Badge>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Experience the Ashram
            </h3>
            <p className="text-muted-foreground mb-8">
              Located amidst the serene hills of Bangalore, our ashram welcomes visitors
              from around the world to experience peace and spiritual growth.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    Art of Living International Center,<br />
                    21st KM, Kanakapura Road, Udayapura,<br />
                    Bangalore - 560082, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+91 80 6733 8888</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">info@artofliving.org</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-8"
              onClick={handleGetDirections}
            >
              Get Directions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
