import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface StickyMobileCTAProps {
  onRegister: () => void;
}

/**
 * Sticky Mobile CTA Component
 * Shows a floating CTA button on mobile devices for easy access to registration
 */
export const StickyMobileCTA = ({ onRegister }: StickyMobileCTAProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setIsVisible(false);
      return;
    }

    // Show CTA after user scrolls down a bit
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);

      // Show CTA after scrolling past hero section
      if (scrollY > 400 && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sticky CTA Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-elevated"
            style={{
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="container max-w-md mx-auto flex items-center gap-3">
              <Button
                onClick={onRegister}
                className="flex-1 h-12 text-base font-medium bg-stone-700 text-amber-50 hover:bg-stone-600"
                aria-label="Sign up for Sri Sri Yoga Deep Dive Level 2"
              >
                Sign me up
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-12 w-12"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
