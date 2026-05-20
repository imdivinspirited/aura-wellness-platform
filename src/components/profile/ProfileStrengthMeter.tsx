/**
 * Profile strength — premium instrument-style gauge (layered dial, bezel, metallic needle).
 */
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ProfileStrengthMeterProps = {
  /** 0–100 */
  value: number;
  className?: string;
};

function zoneForPercent(p: number): { label: string; tone: string } {
  if (p >= 85) return { label: 'Excellent', tone: 'text-emerald-600 dark:text-emerald-400' };
  if (p >= 60) return { label: 'Strong', tone: 'text-teal-600 dark:text-teal-400' };
  if (p >= 35) return { label: 'Growing', tone: 'text-amber-600 dark:text-amber-400' };
  return { label: 'Getting started', tone: 'text-rose-600 dark:text-rose-400' };
}

const CX = 100;
const CY = 100;
const R = 74;
const R_BEZEL = R + 10;
const R_INNER_RING = R - 3;

const ANGLE_LEFT = Math.PI;
const ANGLE_RIGHT = 0;

const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
const ARC_LEN = Math.PI * R;

const NEEDLE_LEN = 52;
const NEEDLE_BASE = 2.2;

const TWEEN = {
  duration: 1.35,
  ease: [0.4, 0, 0.2, 1] as const,
};

function percentToAngle(percent: number): number {
  const t = Math.min(100, Math.max(0, percent)) / 100;
  return ANGLE_LEFT + t * (ANGLE_RIGHT - ANGLE_LEFT);
}

function valueToNeedleDeg(v: number): number {
  const a = percentToAngle(v);
  return ((ANGLE_LEFT - a) * 180) / Math.PI;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  };
}

/** Arc between two angles on the dial (upper semicircle sweep). */
function arcBetween(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const diff = a0 - a1;
  const largeArc = Math.abs(diff) > Math.PI ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
}

/** Pie slice from center — zone tint under the scale. */
function sectorPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const diff = a0 - a1;
  const largeArc = Math.abs(diff) > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
}

const SCALE_TICKS = Array.from({ length: 21 }, (_, i) => i * 5);

export const ProfileStrengthMeter = memo(function ProfileStrengthMeter({
  value,
  className,
}: ProfileStrengthMeterProps) {
  const p = Math.min(100, Math.max(0, value));
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradArc = `ps-arc-${uid}`;
  const gradArcBloom = `ps-arcbloom-${uid}`;
  const gradDial = `ps-dial-${uid}`;
  const gradBezel = `ps-bezel-${uid}`;
  const gradNeedle = `ps-needle-${uid}`;
  const gradNeedleCap = `ps-cap-${uid}`;
  const filterGlow = `ps-fglow-${uid}`;
  const filterBloom = `ps-bloom-${uid}`;
  const filterSoft = `ps-soft-${uid}`;
  const filterNeedle = `ps-nsh-${uid}`;

  const zone = useMemo(() => zoneForPercent(p), [p]);
  const dashOffset = ARC_LEN * (1 - p / 100);

  const zoneArcs = useMemo(() => {
    const a = (pct: number) => percentToAngle(pct);
    return [
      { a0: ANGLE_LEFT, a1: a(35), color: 'rgba(244,63,94,0.14)', key: 'z1' },
      { a0: a(35), a1: a(60), color: 'rgba(251,191,36,0.12)', key: 'z2' },
      { a0: a(60), a1: ANGLE_RIGHT, color: 'rgba(16,185,129,0.12)', key: 'z3' },
    ];
  }, []);

  const [displayPercent, setDisplayPercent] = useState(0);
  const needleGRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const controls = animate(0, p, {
      duration: TWEEN.duration,
      ease: TWEEN.ease,
      onUpdate: (latest) => {
        setDisplayPercent(Math.round(latest));
        needleGRef.current?.setAttribute('transform', `rotate(${valueToNeedleDeg(latest)})`);
      },
    });
    return () => controls.stop();
  }, [p]);

  return (
    <div
      className={cn(
        'relative w-full max-w-[300px]',
        'before:pointer-events-none before:absolute before:inset-[-20%_-10%_40%_-10%] before:rounded-[100%] before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,63,94,0.12),transparent_50%,rgba(16,185,129,0.08),transparent_70%)] before:opacity-90 before:blur-3xl before:content-[""]',
        className,
      )}
      role="group"
      aria-label={`Profile strength ${p} percent`}
    >
      <div className="relative mx-auto flex flex-col items-center">
        <svg
          viewBox="0 0 200 124"
          className="h-[128px] w-[200px] max-w-full overflow-visible [filter:drop-shadow(0_20px_36px_rgba(0,0,0,0.12))] dark:[filter:drop-shadow(0_24px_48px_rgba(0,0,0,0.45))]"
          aria-hidden
        >
          <defs>
            <radialGradient id={gradDial} cx="50%" cy="72%" r="78%">
              <stop offset="0%" stopColor="hsl(var(--card))" stopOpacity={0.95} />
              <stop offset="45%" stopColor="hsl(var(--muted) / 0.35)" />
              <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity={0.5} />
            </radialGradient>
            <linearGradient id={gradBezel} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.85} />
              <stop offset="35%" stopColor="#e2e8f0" stopOpacity={0.95} />
              <stop offset="65%" stopColor="#cbd5e1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#64748b" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id={gradArc} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="18%" stopColor="#f43f5e" />
              <stop offset="42%" stopColor="#fbbf24" />
              <stop offset="62%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id={gradArcBloom} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fda4af" stopOpacity={0.55} />
              <stop offset="50%" stopColor="#fcd34d" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id={gradNeedle} x1="-100%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="35%" stopColor="#475569" />
              <stop offset="55%" stopColor="#f8fafc" stopOpacity={0.95} />
              <stop offset="72%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <radialGradient id={gradNeedleCap} cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="55%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <filter id={filterGlow} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={filterBloom} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="bl" />
              <feColorMatrix
                in="bl"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={filterSoft} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="s" />
              <feMerge>
                <feMergeNode in="s" />
              </feMerge>
            </filter>
            <filter id={filterNeedle} x="-120%" y="-120%" width="340%" height="340%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#020617" floodOpacity="0.35" />
              <feDropShadow dx="0" dy="-0.5" stdDeviation="0.8" floodColor="#fff" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Outer chrome bezel */}
          <path
            d={arcBetween(CX, CY, R_BEZEL, ANGLE_LEFT, ANGLE_RIGHT)}
            fill="none"
            stroke={`url(#${gradBezel})`}
            strokeWidth={2.75}
            strokeLinecap="round"
            opacity={0.92}
            className="dark:opacity-[0.55]"
          />
          <path
            d={arcBetween(CX, CY, R_BEZEL, ANGLE_LEFT, ANGLE_RIGHT)}
            fill="none"
            stroke="white"
            strokeWidth={0.6}
            strokeLinecap="round"
            opacity={0.25}
            style={{ mixBlendMode: 'overlay' }}
            className="dark:opacity-[0.12]"
          />

          {/* Dial face + subtle zone tint arcs */}
          <path
            d={`M ${CX} ${CY} L ${CX - R_BEZEL + 2} ${CY} A ${R_BEZEL - 2} ${R_BEZEL - 2} 0 0 1 ${CX + R_BEZEL - 2} ${CY} Z`}
            fill={`url(#${gradDial})`}
            opacity={0.97}
          />
          {zoneArcs.map((z) => (
            <path
              key={z.key}
              d={sectorPath(CX, CY, R + 14, z.a0, z.a1)}
              fill={z.color}
              style={{ mixBlendMode: 'multiply' }}
              className="opacity-90 dark:mix-blend-screen dark:opacity-100 dark:[fill-opacity:0.2]"
            />
          ))}

          {/* Inner machined ring */}
          <path
            d={arcBetween(CX, CY, R_INNER_RING, ANGLE_LEFT, ANGLE_RIGHT)}
            fill="none"
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeDasharray="1.2 3.5"
            opacity={0.85}
          />

          {/* Scale */}
          <g>
            {SCALE_TICKS.map((tick) => {
              const ang = percentToAngle(tick);
              const isMajor = tick % 20 === 0;
              const isMid = !isMajor && tick % 10 === 0;
              const outerR = R + 11;
              const innerR = isMajor ? R - 0.5 : isMid ? R + 2.8 : R + 4.2;
              const outer = polar(CX, CY, outerR, ang);
              const inner = polar(CX, CY, innerR, ang);
              const labelR = outerR + 10;
              const lp = polar(CX, CY, labelR, ang);
              return (
                <g key={tick}>
                  <line
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke={
                      isMajor
                        ? 'hsl(var(--foreground) / 0.55)'
                        : isMid
                          ? 'hsl(var(--foreground) / 0.35)'
                          : 'hsl(var(--foreground) / 0.2)'
                    }
                    strokeWidth={isMajor ? 1.65 : isMid ? 1.05 : 0.5}
                    strokeLinecap="round"
                  />
                  {isMajor ? (
                    <text
                      x={lp.x}
                      y={lp.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground/80 dark:fill-foreground/85"
                      style={{
                        fontSize: '7.75px',
                        fontWeight: 600,
                        letterSpacing: '-0.03em',
                        fontFeatureSettings: '"tnum"',
                      }}
                    >
                      {tick}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          {/* Groove track */}
          <path
            d={ARC_PATH}
            fill="none"
            stroke="hsl(var(--foreground) / 0.12)"
            strokeWidth={11}
            strokeLinecap="round"
            className="dark:stroke-white/10"
          />
          <path
            d={ARC_PATH}
            fill="none"
            stroke="black"
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.18}
            className="dark:opacity-35"
          />
          <path
            d={ARC_PATH}
            fill="none"
            stroke="white"
            strokeWidth={1.25}
            strokeLinecap="round"
            opacity={0.14}
            style={{ mixBlendMode: 'overlay' }}
          />

          {/* Bloom under progress */}
          <motion.path
            d={ARC_PATH}
            fill="none"
            stroke={`url(#${gradArcBloom})`}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            opacity={0.55}
            filter={`url(#${filterSoft})`}
            initial={{ strokeDashoffset: ARC_LEN }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{
              strokeDashoffset: { duration: TWEEN.duration, ease: TWEEN.ease },
            }}
          />

          <motion.path
            d={ARC_PATH}
            fill="none"
            stroke={`url(#${gradArc})`}
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            filter={`url(#${filterBloom})`}
            initial={{ strokeDashoffset: ARC_LEN }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{
              strokeDashoffset: { duration: TWEEN.duration, ease: TWEEN.ease },
            }}
          />

          <motion.path
            d={ARC_PATH}
            fill="none"
            stroke={`url(#${gradArc})`}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            filter={`url(#${filterGlow})`}
            initial={{ strokeDashoffset: ARC_LEN }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{
              strokeDashoffset: { duration: TWEEN.duration, ease: TWEEN.ease },
            }}
          />

          {/* Specular rim on arc */}
          <motion.path
            d={ARC_PATH}
            fill="none"
            stroke="white"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            opacity={0.35}
            style={{ mixBlendMode: 'overlay' }}
            initial={{ strokeDashoffset: ARC_LEN }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{
              strokeDashoffset: { duration: TWEEN.duration, ease: TWEEN.ease },
            }}
          />

          {/* Needle stack */}
          <g transform={`translate(${CX} ${CY})`}>
            <g ref={needleGRef} transform="rotate(0)" filter={`url(#${filterNeedle})`}>
              <polygon
                points={`${-NEEDLE_LEN - 1},1 ${NEEDLE_BASE + 1},${-5} ${NEEDLE_BASE + 1},${5}`}
                fill="#020617"
                opacity={0.35}
              />
              <polygon
                points={`${-NEEDLE_LEN},0 ${NEEDLE_BASE},${-4.2} ${NEEDLE_BASE},${4.2}`}
                fill={`url(#${gradNeedle})`}
                stroke="#0f172a"
                strokeWidth={0.35}
              />
              <line
                x1={-NEEDLE_LEN + 6}
                y1={-1.1}
                x2={NEEDLE_BASE - 0.5}
                y2={-1.1}
                stroke="white"
                strokeWidth={0.85}
                opacity={0.35}
                strokeLinecap="round"
              />
              <circle r={7.2} fill="#0f172a" opacity={0.5} />
              <circle r={6.6} fill={`url(#${gradNeedleCap})`} stroke="#334155" strokeWidth={0.8} />
              <circle r={3.2} fill="#1e293b" stroke="white" strokeOpacity={0.35} strokeWidth={0.45} />
              <circle r={1.35} fill="#f8fafc" opacity={0.95} />
            </g>
          </g>
        </svg>

        {/* Premium readout */}
        <div className="relative -mt-1 flex flex-col items-center text-center">
          <div
            className="mb-1 h-px w-12 bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
            aria-hidden
          />
          <span
            className={cn(
              'bg-gradient-to-b from-foreground via-foreground to-foreground/65 bg-clip-text font-display text-[2.65rem] font-semibold tabular-nums leading-none tracking-tight text-transparent sm:text-[2.85rem]',
              'drop-shadow-[0_1px_0_rgba(255,255,255,0.08)] dark:from-white dark:via-white dark:to-white/70',
            )}
            aria-live="polite"
          >
            {displayPercent}
            <span className="bg-gradient-to-b from-muted-foreground to-muted-foreground/70 bg-clip-text text-[1.65rem] font-medium sm:text-[1.75rem]">
              %
            </span>
          </span>
          <span
            className={cn(
              'mt-1.5 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/[0.04] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]',
              zone.tone,
            )}
          >
            {zone.label}
          </span>
          <span className="mt-2 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground/75">
            Profile strength
          </span>
        </div>
      </div>
    </div>
  );
});
