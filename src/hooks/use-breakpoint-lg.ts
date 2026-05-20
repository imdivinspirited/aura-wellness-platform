import * as React from 'react';

const LG = 1024;

/** `true` when viewport is at least Tailwind `lg` (1024px). SSR-safe: false until mounted. */
export function useBreakpointLg() {
  const [lg, setLg] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG}px)`);
    const sync = () => setLg(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  return lg;
}
