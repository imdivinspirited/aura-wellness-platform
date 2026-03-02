/**
 * Testimonials - Share Experience Section
 *
 * Call-to-action for sharing testimonials.
 */

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const ShareExperienceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Share Your Story
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your transformation story can inspire others. Share your experience and be part of a global community of positive change.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/connect/support">
                  Share Your Experience
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
