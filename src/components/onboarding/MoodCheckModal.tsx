import { motion } from 'framer-motion';
import { useState } from 'react';
import { Smile, Meh, Frown, CloudRain, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore, type MoodType } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const moods = [
  { 
    type: 'happy' as MoodType, 
    label: 'Happy', 
    labelHi: 'खुश', 
    icon: Smile, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
    selectedBg: 'bg-green-500/20 border-green-500',
  },
  { 
    type: 'calm' as MoodType, 
    label: 'Calm', 
    labelHi: 'शांत', 
    icon: Heart, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
    selectedBg: 'bg-blue-500/20 border-blue-500',
  },
  { 
    type: 'neutral' as MoodType, 
    label: 'Neutral', 
    labelHi: 'सामान्य', 
    icon: Meh, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
    selectedBg: 'bg-amber-500/20 border-amber-500',
  },
  { 
    type: 'sad' as MoodType, 
    label: 'Sad', 
    labelHi: 'उदास', 
    icon: Frown, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
    selectedBg: 'bg-orange-500/20 border-orange-500',
  },
  { 
    type: 'depressed' as MoodType, 
    label: 'Low', 
    labelHi: 'निराश', 
    icon: CloudRain, 
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30',
    selectedBg: 'bg-slate-500/20 border-slate-500',
  },
];

export const MoodCheckModal = () => {
  const { shouldShowMoodCheck, setMood, hasCompletedLanguageSetup } = useUserStore();
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  const [isOpen, setIsOpen] = useState(true);

  const showModal = hasCompletedLanguageSetup && shouldShowMoodCheck() && isOpen;

  const handleConfirm = () => {
    if (selectedMood) {
      setMood(selectedMood);
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    setMood('neutral'); // Default to neutral if skipped
    setIsOpen(false);
  };

  if (!showModal) return null;

  return (
    <Dialog open={showModal}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="hero-gradient p-6 pb-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="absolute right-4 top-4 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>

          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mx-auto mb-4"
            >
              <span className="text-5xl">🙏</span>
            </motion.div>
            <DialogTitle className="font-display text-2xl">
              Abhi aap kaisa mehsoos kar rahe ho?
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              How are you feeling right now?
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood, index) => {
              const Icon = mood.icon;
              const isSelected = selectedMood === mood.type;

              return (
                <motion.button
                  key={mood.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMood(mood.type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all',
                    isSelected ? mood.selectedBg : mood.bgColor
                  )}
                >
                  <Icon className={cn('h-8 w-8', mood.color)} />
                  <div className="text-center">
                    <p className="text-xs font-medium">{mood.labelHi}</p>
                    <p className="text-[10px] text-muted-foreground">{mood.label}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Supportive Message */}
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-xl bg-muted/50 text-center"
            >
              <p className="text-sm text-muted-foreground">
                {selectedMood === 'happy' && "Wonderful! Let's keep that positive energy flowing ✨"}
                {selectedMood === 'calm' && "Beautiful state of mind. Inner peace is precious 🕊️"}
                {selectedMood === 'neutral' && "A balanced state. Ready to explore? 🌿"}
                {selectedMood === 'sad' && "It's okay to feel this way. We're here for you 💙"}
                {selectedMood === 'depressed' && "You're not alone. Consider our wellness programs 🤗"}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button 
              onClick={handleConfirm}
              disabled={!selectedMood}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Continue
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
