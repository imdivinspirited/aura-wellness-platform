import { useEffect, useMemo, useState } from 'react';

type Props = {
  className?: string;
  title?: string;
};

function getTimeParts(d: Date) {
  const ms = d.getMilliseconds();
  const s = d.getSeconds() + ms / 1000;
  const m = d.getMinutes() + s / 60;
  const h = (d.getHours() % 12) + m / 60;
  return { h, m, s };
}

/**
 * Live clock icon (macOS-like “alive” icon).
 * Pure SVG + timer; lightweight and works with Tailwind color classes.
 */
export function LiveClockIcon({ className, title = 'Clock' }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // 1Hz is enough for icon; avoids unnecessary battery drain.
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { h, m, s } = useMemo(() => getTimeParts(now), [now]);

  // Angles: 12 o'clock is -90deg in SVG.
  const hourAngle = h * 30 - 90;
  const minAngle = m * 6 - 90;
  const secAngle = s * 6 - 90;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <title>{title}</title>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" opacity="0.9" />

      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity="0.95">
        <line
          x1="12"
          y1="12"
          x2={12 + Math.cos((hourAngle * Math.PI) / 180) * 4.1}
          y2={12 + Math.sin((hourAngle * Math.PI) / 180) * 4.1}
        />
      </g>

      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" opacity="0.95">
        <line
          x1="12"
          y1="12"
          x2={12 + Math.cos((minAngle * Math.PI) / 180) * 5.8}
          y2={12 + Math.sin((minAngle * Math.PI) / 180) * 5.8}
        />
      </g>

      <g stroke="currentColor" strokeLinecap="round" strokeWidth="0.9" opacity="0.75">
        <line
          x1="12"
          y1="12"
          x2={12 + Math.cos((secAngle * Math.PI) / 180) * 6.8}
          y2={12 + Math.sin((secAngle * Math.PI) / 180) * 6.8}
        />
      </g>
    </svg>
  );
}

