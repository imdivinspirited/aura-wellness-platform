import {
  Baby,
  BookOpen,
  Bus,
  Calendar,
  Compass,
  Heart,
  Hotel,
  LayoutGrid,
  Moon,
  Mountain,
  ShoppingBag,
  Sparkles,
  Sun,
  Tent,
  Users,
  Utensils,
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
        href: '/programs/beginning',
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
        href: '/programs/advance',
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
        href: '/programs/children-teens',
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
        href: '/programs/more',
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
        href: '/programs/retreats',
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
    children: [
      { id: 'shopping', label: 'Shopping', icon: ShoppingBag, href: '/services/shopping' },
      { id: 'dining', label: 'Dining', icon: Utensils, href: '/services/dining' },
      { id: 'stay', label: 'Stay & Meals', icon: Hotel, href: '/services/stay' },
      { id: 'transport', label: 'Transport', icon: Bus, href: '/services/transport' },
      { id: 'facilities', label: 'Facilities', icon: Mountain, href: '/services/facilities' },
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
    children: [
      { id: 'about', label: 'About the Ashram', href: '/explore/about' },
      { id: 'mission', label: 'Mission & Vision', href: '/explore/mission' },
      { id: 'articles', label: 'Articles & Blogs', href: '/explore/articles' },
      { id: 'videos', label: 'Videos & Talks', href: '/explore/videos' },
      { id: 'testimonials', label: 'Testimonials', href: '/explore/testimonials' },
    ],
  },

  /* ================= CONNECT ================= */
  {
    id: 'connect',
    label: 'Connect',
    labelKey: 'nav.connect',
    icon: Users,
    href: '/connect',
    children: [
      { id: 'contact', label: 'Contact Us', href: '/connect/contact' },
      { id: 'support', label: 'Support Desk', href: '/connect/support' },
      { id: 'faq', label: 'FAQs', href: '/connect/faqs' },
    ],
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
