import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LOTUS_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FF6B35]">
    <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2z" />
  </svg>
);

const dotVariants = {
  initial: { scale: 0.6, opacity: 0.3 },
  animate: { scale: 1, opacity: 1 },
};

const dotTransition = (delay: number) => ({
  duration: 0.6,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut',
  delay,
});

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-2 items-end', className)}>
      {/* Avatar with breathing pulse */}
      <motion.div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10"
        animate={{
          boxShadow: [
            '0 0 0 0px rgba(255,107,53,0.15)',
            '0 0 0 6px rgba(255,107,53,0.05)',
            '0 0 0 0px rgba(255,107,53,0.15)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {LOTUS_SVG}
      </motion.div>

      {/* Typing bubble */}
      <div className="rounded-[20px] rounded-bl-[4px] bg-[#FAFAF8] dark:bg-[#2D2D44] px-5 py-3 shadow-sm border border-[#C9A227]/15">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#C9A227]"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={dotTransition(delay)}
              />
            ))}
          </div>
          <motion.span
            className="text-xs text-muted-foreground ml-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            thinking...
          </motion.span>
        </div>
      </div>
    </div>
  );
}
