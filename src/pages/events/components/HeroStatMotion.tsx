import * as React from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';

type CountUpProps = {
  end: number;
  decimals?: number;
  suffix: string;
  className?: string;
};

/**
 * Smooth count-up for hero stats (reach, countries). Respects reduced motion.
 */
export function HeroStatCountUp({ end, decimals = 0, suffix, className }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = React.useState(reduceMotion ? end : 0);
  const rafRef = React.useRef<ReturnType<typeof animate> | null>(null);

  React.useEffect(() => {
    if (reduceMotion) {
      setValue(end);
      return;
    }
    setValue(0);
    rafRef.current?.stop();
    rafRef.current = animate(0, end, {
      duration: 1.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => rafRef.current?.stop();
  }, [end, reduceMotion]);

  const formatted =
    decimals === 0
      ? Math.round(value).toLocaleString('en-IN')
      : value.toFixed(decimals);

  return (
    <span className={className}>
      <span className="tabular-nums tracking-tight text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.12)]">
        {formatted}
      </span>
      {suffix}
    </span>
  );
}

type DateRevealProps = {
  text: string;
  className?: string;
};

/**
 * Date line with a light reveal + stagger when a range uses " - ".
 */
type TextRevealProps = {
  text: string;
  className?: string;
};

/** Subtle reveal for location / non-numeric hero lines (matches date motion language). */
export function HeroStatTextReveal({ text, className }: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <p className={className}>{text}</p>;
  }
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 4, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.48, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.p>
  );
}

export function HeroStatDateReveal({ text, className }: DateRevealProps) {
  const reduceMotion = useReducedMotion();
  const parts = text.split(' - ');

  if (reduceMotion) {
    return <p className={className}>{text}</p>;
  }

  if (parts.length === 1) {
    return (
      <motion.p
        className={className}
        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.p>
    );
  }

  return (
    <p className={className}>
      <motion.span
        className="inline-block tabular-nums"
        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {parts[0]}
      </motion.span>
      <motion.span
        className="mx-0.5 inline-block text-white/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        aria-hidden
      >
        –
      </motion.span>
      <motion.span
        className="inline-block tabular-nums"
        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {parts[1]}
      </motion.span>
    </p>
  );
}
