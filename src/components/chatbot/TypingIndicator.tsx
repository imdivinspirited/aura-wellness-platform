import { motion } from 'framer-motion';
import { OperatorIcon } from '@/components/chatbot/OperatorIcon';
import { cn } from '@/lib/utils';

const dotVariants = {
  initial: { scale: 0.65, opacity: 0.35 },
  animate: { scale: 1, opacity: 1 },
};

const dotTransition = (delay: number) => ({
  duration: 0.55,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut',
  delay,
});

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end gap-2.5', className)}>
      <OperatorIcon size="sm" className="shrink-0 text-muted-foreground" />

      <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 0.12, 0.24].map((delay, i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={dotTransition(delay)}
              />
            ))}
          </div>
          <motion.span
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Composing
          </motion.span>
        </div>
      </div>
    </div>
  );
}
