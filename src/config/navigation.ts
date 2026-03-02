import {
  Baby,
  BookOpen,
  Briefcase,
  Bus,
  Calendar,
  Compass,
  FileText,
  Heart,
  Hotel,
  LayoutGrid,
  MessageCircle,
  Moon,
  Mountain,
  ShoppingBag,
  Sparkles,
  Sun,
  Tent,
  Users,
  Utensils,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/* ================= TYPES ================= */

export interface NavItem {
  id: string;
  label: string;
  /**
   * Optional i18n key for the label (preferred).
   * Backward-compatible: if missing, UI falls back to `label`.
   */
  labelKey?: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavItem[];
  badge?: string;
  priority?: number;
  externalUrl?: string;
  /**
   * Optional rich description used on landing pages and cards.
   */
  description?: string;
}

/* ================= NAVIGATION ================= */

export const navigationItems: NavItem[] = [
  /* ================= PROGRAMS ================= */
  {
    id: 'programs',
    label: 'Programs',
    labelKey: 'nav.programs',
    icon: BookOpen,
    href: '/programs',
    children: [
      /* -------- BEGINNING -------- */
      {
        id: 'beginning',
        label: 'Beginning',
        icon: Sparkles,
        href: '/programs?category=beginning',
        children: [
          {
            id: 'happiness-program',
            label: 'Happiness Program',
            href: '/programs/happiness-program',
            externalUrl: 'https://programs.vvmvp.org/',
          },
          {
            id: 'corporate',
            label: 'Corporate Programs',
            href: '/programs/corporate',
          },
          {
            id: 'sahaj-samadhi',
            label: 'Sahaj Samadhi Dhyan Yoga',
            href: '/programs/sahaj-samadhi',
          },
          {
            id: 'sri-sri-yoga',
            label: 'Sri Sri Yoga Classes',
            href: '/programs/sri-sri-yoga',
          },
          {
            id: 'silence-retreat',
            label: 'Silence Retreat',
            href: '/programs/silence-retreat',
          },
          {
            id: 'wellness',
            label: 'Wellness Programs',
            href: '/programs/wellness',
          },
        ],
      },

      /* -------- ADVANCED -------- */
      {
        id: 'advance',
        label: 'Advanced',
        icon: Zap,
        href: '/programs?category=advanced',
        children: [
          {
            id: 'amp',
            label: 'Advanced Meditation Program (AMP)',
            href: '/programs/advance/amp',
          },
          {
            id: 'dsn',
            label: 'Dynamism for Self & Nation (DSN)',
            href: '/programs/advance/dsn',
          },
          {
            id: 'blessings',
            label: 'The Blessings Program',
            href: '/programs/advance/blessings',
          },
          {
            id: 'ssy-level-2',
            label: 'Sri Sri Yoga Deep Dive (Level 2)',
            href: '/programs/advance/sri-sri-yoga-deep-dive-level-2',
          },
          {
            id: 'samyam',
            label: 'Samyam',
            href: '/programs/advance/samyam',
          },
        ],
      },

      /* -------- CHILDREN & TEENS -------- */
      {
        id: 'children-teens',
        label: 'Children & Teens',
        icon: Baby,
        href: '/programs?category=children',
        children: [
          { id: 'uy', label: 'Utkarsha Yoga', href: '/programs/uy' },
          { id: 'myl-1', label: 'MYL-1', href: '/programs/myl-1' },
          { id: 'myl-2', label: 'MYL-2', href: '/programs/myl-2' },
          { id: 'ip', label: 'Intuition Process', href: '/programs/ip' },
        ],
      },

      /* -------- MORE PROGRAMS -------- */
      {
        id: 'more-programs',
        label: 'More Programs',
        icon: LayoutGrid,
        href: '/programs?category=more',
        children: [
          { id: 'vedic-wisdom', label: 'Vedic Wisdom', href: '/programs/vedic-wisdom' },
          { id: 'panchkarma', label: 'Panchkarma', href: '/programs/panchkarma' },
          {
            id: 'yoga-deep-dive',
            label: 'Sri Sri Yoga Deep Dive',
            href: '/programs/yoga-deep-dive',
          },
          { id: 'hatha-yoga', label: 'Hatha Yoga Sadhana', href: '/programs/hatha-yoga' },
          { id: 'spine-care', label: 'Spine Care Yoga', href: '/programs/spine-care' },
        ],
      },

      /* -------- RETREATS -------- */
      {
        id: 'retreats',
        label: 'Retreats',
        icon: Tent,
        href: '/programs?category=retreats',
        children: [
          {
            id: 'corporate-retreats',
            label: 'Corporate Wellbeing Retreats',
            href: '/programs/corporate-retreats',
          },
          {
            id: 'self-designed',
            label: 'Self-Designed Getaways',
            href: '/programs/self-designed',
          },
          {
            id: 'host-program',
            label: 'Host Your Program',
            href: '/programs/host',
          },
        ],
      },
    ],
  },

  /* ================= SERVICES ================= */
  {
    id: 'services',
    label: 'Services',
    labelKey: 'nav.services',
    icon: Heart,
    href: '/services',
    description: 'Everything you need for a comfortable, safe and inspiring stay at the ashram.',
    children: [
      {
        id: 'shopping',
        label: 'Shopping',
        icon: ShoppingBag,
        href: '/services/shopping',
        description: 'Souvenir shops, book stores, and wellness products to take the ashram experience home.',
      },
      {
        id: 'dining',
        label: 'Dining',
        icon: Utensils,
        href: '/services/dining',
        description: 'Sattvic, freshly prepared meals that nourish body and mind throughout your stay.',
      },
      {
        id: 'stay',
        label: 'Stay & Meals',
        icon: Hotel,
        href: '/services/stay',
        description: 'Comfortable accommodations with curated meal plans for individuals, families, and groups.',
      },
      {
        id: 'transport',
        label: 'Transport',
        icon: Bus,
        href: '/services/transport',
        description: 'Airport transfers and eco-friendly campus transport to help you move around with ease.',
      },
      {
        id: 'facilities',
        label: 'Facilities',
        icon: Mountain,
        href: '/services/facilities',
        description: 'Medical care, utilities, and essential amenities available across the campus 24/7.',
      },
    ],
  },

  /* ================= EVENTS ================= */
  {
    id: 'events',
    label: 'Events',
    labelKey: 'nav.events',
    icon: Calendar,
    href: '/events',
    badge: 'Live',
    children: [
      { id: 'upcoming', label: 'Upcoming Events', icon: Sun, href: '/events/upcoming' },
      {
        id: 'ongoing',
        label: 'Ongoing Events',
        icon: Sparkles,
        href: '/events/ongoing',
        badge: 'Live',
      },
      { id: 'past', label: 'Past Events', icon: Moon, href: '/events/past' },
    ],
  },

  /* ================= EXPLORE ================= */
  {
    id: 'explore',
    label: 'Explore',
    labelKey: 'nav.explore',
    icon: Compass,
    href: '/explore',
    description: 'Immerse yourself in the stories, spaces, and wisdom traditions that make Aura special.',
    children: [
      {
        id: 'about',
        label: 'About the Ashram',
        icon: Compass,
        href: '/explore/about',
        description: 'Discover the origins, philosophy, and daily rhythm of life at the ashram.',
      },
      {
        id: 'mission',
        label: 'Mission & Vision',
        icon: Heart,
        href: '/explore/mission',
        description: 'Learn about our guiding values, impact stories, and global initiatives.',
      },
      {
        id: 'articles',
        label: 'Articles & Blogs',
        icon: FileText,
        href: '/explore/articles',
        description: 'In-depth insights on yoga, meditation, wellness, spirituality, and mindful living.',
      },
      {
        id: 'videos',
        label: 'Videos & Talks',
        icon: Video,
        href: '/explore/videos',
        description: 'Watch discourses, guided practices, interviews, and inspiring talks from experts.',
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        icon: MessageCircle,
        href: '/explore/testimonials',
        description: 'Real stories and transformations from participants and visitors across the world.',
      },
    ],
  },

  /* ================= CONNECT ================= */
  {
    id: 'connect',
    label: 'Connect',
    labelKey: 'nav.connect',
    icon: Users,
    href: '/connect',
    description: 'Reach out for guidance, support, and resources before, during, and after your visit.',
    children: [
      {
        id: 'contact',
        label: 'Contact Us',
        icon: MessageCircle,
        href: '/connect/contact',
        description: 'Find phone numbers, email contacts, directions, and booking assistance.',
      },
      {
        id: 'support',
        label: 'Support Desk',
        icon: Heart,
        href: '/connect/support',
        description: 'Get help with registrations, payments, cancellations, and other queries.',
      },
      {
        id: 'faq',
        label: 'FAQs',
        icon: FileText,
        href: '/connect/faqs',
        description: 'Browse quick answers to common questions about programs, stay, and services.',
      },
    ],
  },

  /* ================= SEVA & CAREERS ================= */
  {
    id: 'seva-careers',
    label: 'Seva & Careers',
    labelKey: 'nav.sevaCareers',
    icon: Briefcase,
    href: '/seva-careers',
    description: 'Serve, grow and thrive at Art of Living Ashram — Seva, Jobs, Internships.',
  },
];

/* ================= HELPERS ================= */

export const findNavItemByPath = (items: NavItem[], path: string): NavItem | null => {
  for (const item of items) {
    if (item.href === path) return item;
    if (item.children) {
      const found = findNavItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

export const getParentChain = (
  items: NavItem[],
  targetId: string,
  chain: NavItem[] = []
): NavItem[] | null => {
  for (const item of items) {
    if (item.id === targetId) return [...chain, item];
    if (item.children) {
      const found = getParentChain(item.children, targetId, [...chain, item]);
      if (found) return found;
    }
  }
  return null;
};

export const getMainNavItem = (id: string): NavItem | undefined =>
  navigationItems.find(item => item.id === id);

export const getSubNavItems = (mainNavId: string): NavItem[] =>
  getMainNavItem(mainNavId)?.children || [];

export const getChildNavItems = (mainNavId: string, subNavId: string): NavItem[] =>
  getSubNavItems(mainNavId).find(item => item.id === subNavId)?.children || [];
