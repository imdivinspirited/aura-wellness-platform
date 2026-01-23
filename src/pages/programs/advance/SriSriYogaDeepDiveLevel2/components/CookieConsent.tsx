import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          style={{
            marginLeft: 'var(--sidebar-width, 0px)',
          }}
        >
          <div className="container max-w-6xl">
            <div className="bg-background border border-border rounded-lg shadow-elevated p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold mb-2">Cookie Consent</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                  By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="w-full md:w-auto"
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="w-full md:w-auto"
                >
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAccept}
                  className="absolute top-4 right-4 md:relative md:top-0 md:right-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
