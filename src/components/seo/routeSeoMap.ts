/**
 * Longest-prefix route SEO: unique titles for known paths; section fallbacks; generic brand title last.
 */

const BRAND = 'The AOLIC Bangalore';

export const DEFAULT_SITE_DESCRIPTION =
  'The AOLIC Bangalore — Art of Living International Center. Yoga, meditation, Sudarshan Kriya, events, stay, dining, and wellness programs.';

type Entry = { prefix: string; title: string; description: string };

const ENTRIES: Entry[] = [
  // ——— Auth ———
  {
    prefix: '/auth/callback',
    title: `OAuth callback | ${BRAND}`,
    description: 'Completing sign-in with your account.',
  },
  {
    prefix: '/auth/verify-signup',
    title: `Verify sign-up | ${BRAND}`,
    description: 'Confirm your email to finish creating your account.',
  },
  {
    prefix: '/auth/verify-email',
    title: `Verify email | ${BRAND}`,
    description: 'Verify your email address for your account.',
  },
  {
    prefix: '/auth/reset-password',
    title: `Reset password | ${BRAND}`,
    description: 'Set a new password for your account.',
  },
  {
    prefix: '/auth/forgot-password',
    title: `Forgot password | ${BRAND}`,
    description: 'Request a link to reset your account password.',
  },
  {
    prefix: '/auth/register',
    title: `Create account | ${BRAND}`,
    description: 'Register for programs, bookings, and updates at the Bangalore International Center.',
  },
  {
    prefix: '/auth/login',
    title: `Sign in | ${BRAND}`,
    description: 'Sign in to your account for programs and bookings.',
  },
  // ——— Account / profile ———
  {
    prefix: '/settings',
    title: `Settings | Account | ${BRAND}`,
    description: 'Language, appearance, privacy, and notification preferences.',
  },
  {
    prefix: '/profile',
    title: `Profile | ${BRAND}`,
    description: 'Your profile, mood journey, and account overview.',
  },
  {
    prefix: '/checkout',
    title: `Checkout | ${BRAND}`,
    description: 'Complete your booking or purchase securely.',
  },
  {
    prefix: '/orders',
    title: `Orders | ${BRAND}`,
    description: 'View your orders and receipts.',
  },
  // ——— Root / admin ———
  {
    prefix: '/root/dashboard',
    title: `Root dashboard | ${BRAND}`,
    description: 'Operator tools and site management.',
  },
  {
    prefix: '/root/editor',
    title: `Visual editor | ${BRAND}`,
    description: 'Edit published pages and content.',
  },
  {
    prefix: '/root/signup',
    title: `Root sign-up | ${BRAND}`,
    description: 'Create a root operator account (restricted).',
  },
  {
    prefix: '/root/login',
    title: `Root sign-in | ${BRAND}`,
    description: 'Root operator sign-in.',
  },
  {
    prefix: '/admin/dashboard',
    title: `Admin dashboard | ${BRAND}`,
    description: 'Programs, events, and content administration.',
  },
  {
    prefix: '/admin/pages',
    title: `Edit page | Admin | ${BRAND}`,
    description: 'Edit CMS page content.',
  },
  {
    prefix: '/admin',
    title: `Admin | ${BRAND}`,
    description: 'Site administration and CMS tools.',
  },
  // ——— Programs (exact paths from App routes) ———
  {
    prefix: '/programs/happiness-program',
    title: `Happiness Program | ${BRAND}`,
    description: 'Transform your life with SKY breathing, meditation, and wisdom.',
  },
  {
    prefix: '/programs/corporate',
    title: `Corporate programs | ${BRAND}`,
    description: 'Workplace wellness, stress management, and team programs.',
  },
  {
    prefix: '/programs/sahaj-samadhi',
    title: `Sahaj Samadhi Meditation | ${BRAND}`,
    description: 'Effortless meditation for deep rest and clarity.',
  },
  {
    prefix: '/programs/sri-sri-yoga',
    title: `Sri Sri Yoga | ${BRAND}`,
    description: 'Holistic yoga with asanas, pranayama, and meditation.',
  },
  {
    prefix: '/programs/silence-retreat',
    title: `Silence retreat | ${BRAND}`,
    description: 'Residential silent retreat for deep inner transformation.',
  },
  {
    prefix: '/programs/wellness',
    title: `Wellness programs | ${BRAND}`,
    description: 'Holistic wellness courses at the ashram.',
  },
  {
    prefix: '/programs/advance/amp',
    title: `Advanced Meditation Program (AMP) | ${BRAND}`,
    description: 'Advanced residential meditation and higher states of consciousness.',
  },
  {
    prefix: '/programs/advance/dsn',
    title: `DSN — Dynamism for Self and Nation | ${BRAND}`,
    description: 'Leadership and service excellence program.',
  },
  {
    prefix: '/programs/advance/blessings',
    title: `Blessings program | ${BRAND}`,
    description: 'Blessings and advanced residential program.',
  },
  {
    prefix: '/programs/advance/sri-sri-yoga-deep-dive-level-2',
    title: `Sri Sri Yoga Deep Dive Level 2 | ${BRAND}`,
    description: 'Deep dive yoga training at the International Center.',
  },
  {
    prefix: '/programs/advance/samyam',
    title: `Samyam | ${BRAND}`,
    description: 'Advanced practice and residential program.',
  },
  {
    prefix: '/programs/utkarsha-yoga',
    title: `Utkarsha Yoga | ${BRAND}`,
    description: 'Children and teens yoga program.',
  },
  {
    prefix: '/programs/uy',
    title: `Utkarsha Yoga | ${BRAND}`,
    description: 'Children and teens yoga program.',
  },
  {
    prefix: '/programs/myl-1',
    title: `Medha Yoga Level 1 | ${BRAND}`,
    description: 'Children and teens — Medha Yoga Level 1.',
  },
  {
    prefix: '/programs/myl-2',
    title: `Medha Yoga Level 2 | ${BRAND}`,
    description: 'Children and teens — Medha Yoga Level 2.',
  },
  {
    prefix: '/programs/intuition-process',
    title: `Intuition Process | ${BRAND}`,
    description: 'Program for children and teens.',
  },
  {
    prefix: '/programs/ip',
    title: `Intuition Process | ${BRAND}`,
    description: 'Program for children and teens.',
  },
  {
    prefix: '/programs/vedic-wisdom',
    title: `Vedic wisdom | ${BRAND}`,
    description: 'Vedic knowledge and courses.',
  },
  {
    prefix: '/programs/panchkarma',
    title: `Panchakarma | ${BRAND}`,
    description: 'Ayurvedic rejuvenation and wellness.',
  },
  {
    prefix: '/programs/yoga-deep-dive',
    title: `Sri Sri Yoga deep dive | ${BRAND}`,
    description: 'Deeper yoga practice and training.',
  },
  {
    prefix: '/programs/hatha-yoga',
    title: `Hatha yoga | ${BRAND}`,
    description: 'Classical hatha yoga at the ashram.',
  },
  {
    prefix: '/programs/spine-care',
    title: `Spine care yoga | ${BRAND}`,
    description: 'Yoga for spinal health and mobility.',
  },
  {
    prefix: '/programs/corporate-retreats',
    title: `Corporate retreats | ${BRAND}`,
    description: 'Tailored retreats for organizations.',
  },
  {
    prefix: '/programs/self-designed',
    title: `Self-designed getaways | ${BRAND}`,
    description: 'Design your own retreat experience.',
  },
  {
    prefix: '/programs/host',
    title: `Host your program | ${BRAND}`,
    description: 'Host courses and retreats at the International Center.',
  },
  // ——— Services ———
  {
    prefix: '/services/shopping',
    title: `Shopping | ${BRAND}`,
    description: 'Books, meditation supplies, and ashram store.',
  },
  {
    prefix: '/services/dining',
    title: `Dining | ${BRAND}`,
    description: 'Satvik dining and café at the Bangalore International Center.',
  },
  {
    prefix: '/services/stay',
    title: `Stay | ${BRAND}`,
    description: 'Accommodation options for visitors and program participants.',
  },
  {
    prefix: '/services/transport',
    title: `Transport | ${BRAND}`,
    description: 'Getting to the ashram and local transport information.',
  },
  {
    prefix: '/services/facilities',
    title: `Facilities | ${BRAND}`,
    description: 'Campus facilities and amenities.',
  },
  {
    prefix: '/international',
    title: `International visitors | ${BRAND}`,
    description: 'Travel and visitor information for guests from abroad.',
  },
  // ——— Events ———
  {
    prefix: '/events/youtube',
    title: `YouTube | Events | ${BRAND}`,
    description: 'Watch live and recorded event broadcasts.',
  },
  {
    prefix: '/events/upcoming',
    title: `Upcoming events | ${BRAND}`,
    description: 'Programs and celebrations coming soon.',
  },
  {
    prefix: '/events/ongoing',
    title: `Ongoing events | ${BRAND}`,
    description: 'Events happening now at the International Center.',
  },
  {
    prefix: '/events/past',
    title: `Past events | ${BRAND}`,
    description: 'Archive of celebrations and programs.',
  },
  {
    prefix: '/events',
    title: `Events | ${BRAND}`,
    description: 'Celebrations, satsangs, and special gatherings.',
  },
  // ——— Explore ———
  {
    prefix: '/explore/about',
    title: `About the ashram | ${BRAND}`,
    description: 'The Bangalore International Center and campus.',
  },
  {
    prefix: '/explore/mission',
    title: `Mission & vision | ${BRAND}`,
    description: 'Purpose and values of the Art of Living.',
  },
  {
    prefix: '/explore/articles',
    title: `Articles | ${BRAND}`,
    description: 'Read articles on wisdom, wellness, and practice.',
  },
  {
    prefix: '/explore/videos',
    title: `Videos | ${BRAND}`,
    description: 'Talks, guided sessions, and highlights.',
  },
  {
    prefix: '/explore/testimonials',
    title: `Testimonials | ${BRAND}`,
    description: 'Experiences from participants and visitors.',
  },
  {
    prefix: '/explore',
    title: `Explore | ${BRAND}`,
    description: 'Articles, videos, mission, and about the ashram.',
  },
  // ——— Connect ———
  {
    prefix: '/connect/contact',
    title: `Contact us | ${BRAND}`,
    description: 'Reach the ashram for enquiries and support.',
  },
  {
    prefix: '/connect/support',
    title: `Support | ${BRAND}`,
    description: 'Help desk and visitor support.',
  },
  {
    prefix: '/connect/faqs',
    title: `FAQs | ${BRAND}`,
    description: 'Answers for travellers, NRIs, and visitors.',
  },
  {
    prefix: '/connect/faq',
    title: `FAQs | ${BRAND}`,
    description: 'Answers for travellers, NRIs, and visitors.',
  },
  // ——— Seva ———
  {
    prefix: '/seva-careers',
    title: `Seva & careers | ${BRAND}`,
    description: 'Volunteer and career opportunities.',
  },
  {
    prefix: '/opportunities',
    title: `Opportunities | ${BRAND}`,
    description: 'Ways to engage and serve.',
  },
  // ——— CMS ———
  {
    prefix: '/p',
    title: `Page | ${BRAND}`,
    description: DEFAULT_SITE_DESCRIPTION.slice(0, 160),
  },
  // ——— Public profile ———
  {
    prefix: '/u',
    title: `Profile | ${BRAND}`,
    description: 'Public volunteer or participant profile.',
  },
];

const SORTED = [...ENTRIES].sort((a, b) => b.prefix.length - a.prefix.length);

function normalizePath(pathname: string): string {
  const p = pathname.split('?')[0] || '/';
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p || '/';
}

/** Longest-prefix match for static routes (null if use section / generic fallback). */
export function matchRouteSeo(pathname: string): { title: string; description: string } | null {
  const norm = normalizePath(pathname);
  for (const e of SORTED) {
    if (norm === e.prefix || norm.startsWith(`${e.prefix}/`)) {
      return { title: e.title, description: e.description };
    }
  }
  return null;
}

/** Section fallbacks when no exact route row applies. */
export function seoSectionFallback(pathname: string): { title: string; description: string } {
  const p = normalizePath(pathname);

  if (p === '/' || p === '') {
    return {
      title: `${BRAND} | Meditation, Yoga & Wellness`,
      description: DEFAULT_SITE_DESCRIPTION.slice(0, 160),
    };
  }
  if (p.startsWith('/programs')) {
    return {
      title: `Programs | ${BRAND}`,
      description:
        'Happiness Program, Sri Sri Yoga, silence retreats, corporate wellness, and advanced courses at Art of Living Bangalore Ashram.',
    };
  }
  if (p.startsWith('/events')) {
    return {
      title: `Events | ${BRAND}`,
      description:
        'Celebrations, festivals, satsangs, and special programs at the International Center and online.',
    };
  }
  if (p.startsWith('/services')) {
    return {
      title: `Ashram services | ${BRAND}`,
      description: 'Stay, dining, transport, shopping, and campus facilities for your visit.',
    };
  }
  if (p.startsWith('/explore')) {
    return {
      title: `Explore | ${BRAND}`,
      description: 'Articles, videos, testimonials, mission, and about the ashram.',
    };
  }
  if (p.startsWith('/connect')) {
    return {
      title: `Connect & support | ${BRAND}`,
      description: 'Contact, FAQs, and ways to stay connected.',
    };
  }
  if (p.startsWith('/international')) {
    return {
      title: `International visitors | ${BRAND}`,
      description: 'Travel, visa guidance, and visitor information.',
    };
  }
  if (p.startsWith('/seva-careers') || p.startsWith('/opportunities')) {
    return {
      title: `Seva & careers | ${BRAND}`,
      description: 'Volunteer opportunities and careers at the International Center.',
    };
  }
  if (p.startsWith('/auth')) {
    return {
      title: `Account | ${BRAND}`,
      description: 'Sign in or create an account for programs and bookings.',
    };
  }

  return {
    title: `${BRAND} · Art of Living International Center`,
    description: DEFAULT_SITE_DESCRIPTION.slice(0, 160),
  };
}

/** Final resolved SEO for a path (route map → section → generic). */
export function resolveSeoForPath(pathname: string): { title: string; description: string } {
  const hit = matchRouteSeo(pathname);
  if (hit) return hit;
  return seoSectionFallback(pathname);
}
