import { motion } from 'framer-motion';
import { EVENTS_LISTING_HERO_IMAGE_URL } from '@/pages/events/constants';

const GLASS_MASK =
  'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.22) 32%, rgba(0,0,0,0.72) 58%, rgba(0,0,0,0.92) 100%)';

/**
 * Editorial hero for /events — brand lockup and orientation (not decorative-only).
 * Full-bleed frosted band (masked): no card/box; heavy backdrop blur + milk tint for readable content.
 */
export function EventsListingHero() {
  return (
    <section className="relative flex min-h-[min(40vh,420px)] flex-col justify-end overflow-hidden border-b border-primary/10">
      <div className="absolute inset-0">
        <img
          src={EVENTS_LISTING_HERO_IMAGE_URL}
          alt=""
          className="h-full w-full object-cover object-[center_36%]"
          loading="eager"
          fetchPriority="high"
          width={1920}
          height={1280}
          aria-hidden
        />
        {/* Halka tint — upar photo fresh rahe */}
        <div className="absolute inset-0 bg-stone-900/[0.05] dark:bg-black/10" aria-hidden />

        {/* Glassy blur veil: full width, mask se top clear / neeche zyada blur — koi box outline nahi */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-white/10 to-white/[0.18] backdrop-blur-[42px] backdrop-saturate-150 dark:from-white/[0.02] dark:via-white/[0.06] dark:to-white/10"
          style={{
            WebkitMaskImage: GLASS_MASK,
            maskImage: GLASS_MASK,
          }}
        />
        {/* Extra readbility at bottom — still no rounded box */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[hsl(240_15%_6%/0.5)] via-transparent to-transparent dark:from-[hsl(222_30%_5%/0.55)]"
        />
      </div>

      <div className="relative z-10 container max-w-3xl px-4 pb-8 pt-12 md:px-6 md:pb-10 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-4 md:mb-5 md:gap-6">
            <img
              src="/images/logos/aolic_logo.png"
              alt="Art of Living International Center, Bangalore"
              className="h-11 w-auto opacity-95 md:h-14"
              style={{
                filter:
                  'drop-shadow(0 0 12px rgba(255,255,255,0.45)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
              }}
            />
            <div className="hidden h-12 w-px bg-white/35 sm:block" aria-hidden />
            <p className="hidden max-w-xs text-left text-xs font-medium uppercase tracking-[0.28em] text-white/80 sm:block [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
              Gatherings & observances
            </p>
          </div>

          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-light leading-[1.08] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)]">
            The year at a glance —{' '}
            <span className="bg-gradient-to-r from-[hsl(42_55%_72%)] to-[hsl(42_40%_88%)] bg-clip-text text-transparent [text-shadow:none] drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)]">
              planned for your calendar
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-white/90 md:mt-4 md:text-base [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">
            Filter by how you wish to join, export dates to your phone, and jump straight into what
            matters next — every control here is meant to save you time before you arrive.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
