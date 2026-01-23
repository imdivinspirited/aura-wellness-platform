import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Check, Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, LANGUAGES, type Language } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export const LanguageSelectionModal = () => {
  const { 
    hasCompletedLanguageSetup, 
    language, 
    setLanguage, 
    completeLanguageSetup 
  } = useUserStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(language);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return LANGUAGES;
    const query = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) ||
        lang.nativeName.toLowerCase().includes(query) ||
        lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Featured languages (shown prominently)
  const featuredLanguages = LANGUAGES.slice(0, 3); // English, Hindi, Kannada

  const handleConfirm = () => {
    setLanguage(selectedLang);
    completeLanguageSetup();
  };

  return (
    <Dialog open={!hasCompletedLanguageSetup}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="hero-gradient p-6 pb-4">
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
            >
              <Globe className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="font-display text-2xl">
              नमस्ते! Welcome!
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Choose your preferred language to explore the ashram
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          {/* Featured Languages */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {featuredLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-xl p-4 border-2 transition-all',
                  selectedLang === lang.code
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                {selectedLang === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
                <span className="text-lg font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search more languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* All Languages */}
          <ScrollArea className="h-48 rounded-lg border">
            <div className="p-2 space-y-1">
              {filteredLanguages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors',
                    selectedLang === lang.code
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.nativeName}</span>
                    <span className="text-sm text-muted-foreground">({lang.name})</span>
                  </div>
                  {selectedLang === lang.code && (
                    <Check className="h-4 w-4" />
                  )}
                </motion.button>
              ))}
              
              {filteredLanguages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No languages found
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Confirm Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Button 
              onClick={handleConfirm}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Continue in {LANGUAGES.find(l => l.code === selectedLang)?.name}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
