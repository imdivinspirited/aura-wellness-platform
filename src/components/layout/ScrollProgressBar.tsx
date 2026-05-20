/**
 * Slim top scroll indicator (gradient + soft glow). Native scrollbars hidden in index.css.
 */

import { useEffect, useState } from 'react';

export function ScrollProgressBar() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    const mo = new MutationObserver(update);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      mo.disconnect();
    };
  }, []);

  const pct = p * 100;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[35] h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      <div className="absolute inset-0 bg-border/50 dark:bg-white/[0.06]" aria-hidden />
      <div
        className="scroll-progress-fill absolute left-0 top-0 h-full overflow-hidden rounded-r-sm"
        style={{
          width: `${pct < 0.5 && pct > 0 ? 0.5 : pct}%`,
          transition: 'width 120ms ease-out',
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-[0.96]"
          aria-hidden
        />
        {pct > 1 ? (
          <div
            className="scroll-progress-sheen pointer-events-none absolute inset-y-0 left-0 w-[min(45%,10rem)] motion-reduce:hidden"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
