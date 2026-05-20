import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function IntlStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 lg:bottom-16 left-0 right-0 z-50 px-4"
        >
          <div className="max-w-lg mx-auto bg-foreground/95 backdrop-blur-lg rounded-full px-6 py-3 flex items-center justify-between shadow-xl">
            <div className="hidden sm:block">
              <p className="text-primary-foreground text-sm font-medium">Ready to transform?</p>
              <p className="text-primary-foreground/60 text-xs">Limited spots available</p>
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              onClick={() => window.open('https://programs.vvmvp.org/', '_blank')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
