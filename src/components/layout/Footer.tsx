/**
 * Footer — Art of Living
 * Dark theme (#1a1a2e), gold accents, 4-column grid, newsletter, lotus pattern.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Heart,
  MapPin,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import { SmartLink } from '@/components/ui/SmartLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/artofliving',
  facebook: 'https://www.facebook.com/artofliving',
  youtube: 'https://www.youtube.com/artofliving',
  twitter: 'https://twitter.com/artofliving',
  linkedin: 'https://www.linkedin.com/company/artofliving',
} as const;

const GOLD = 'hsl(43 96% 56%)'; // gold accent

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      {/* Subtle lotus/mandala pattern */}
      <div className="absolute inset-0 opacity-[0.04]" aria-hidden>
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M60 20 L60 100 M20 60 L100 60 M35 35 L85 85 M85 35 L35 85" stroke="currentColor" strokeWidth="0.3" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="container relative py-12 md:py-16">
        {/* 4-column grid: Brand | Quick Links | Programs | Connect */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Column 1: Art of Living + tagline + social */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10 p-2 flex items-center justify-center">
                <img
                  src="/images/logos/aolic_logo_white.png"
                  alt="Art of Living"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-white">Art of Living</h3>
                <p className="text-xs text-white/60">Bangalore Ashram</p>
              </div>
            </div>
            <p className="text-sm text-white/80 italic" style={{ color: GOLD }}>
              Breathe. Smile. Live.
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: SOCIAL_LINKS.instagram, Icon: Instagram, label: 'Instagram' },
                { href: SOCIAL_LINKS.facebook, Icon: Facebook, label: 'Facebook' },
                { href: SOCIAL_LINKS.youtube, Icon: Youtube, label: 'YouTube' },
                { href: SOCIAL_LINKS.twitter, Icon: Twitter, label: 'Twitter' },
                { href: SOCIAL_LINKS.linkedin, Icon: Linkedin, label: 'LinkedIn' },
              ].map(({ href, Icon, label }) => (
                <SmartLink
                  key={label}
                  to={href}
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-amber-400"
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon className="h-5 w-5" />
                </SmartLink>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/explore/about', label: 'About Us' },
                { to: '/events', label: 'Events' },
                { to: '/seva-careers', label: 'Seva & Careers' },
                { to: '/explore/articles', label: 'Blog' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/70 hover:text-amber-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/programs/happiness-program', label: 'SKY / Happiness' },
                { to: '/programs/sri-sri-yoga', label: 'Sri Sri Yoga' },
                { to: '/programs/sahaj-samadhi', label: 'Meditation' },
                { to: '/programs?category=children', label: 'Children & Teens' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-white/70 hover:text-amber-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <a href="mailto:info@artofliving.org" className="hover:text-amber-400 transition-colors">
                  info@artofliving.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <a href="tel:+918067557777" className="hover:text-amber-400 transition-colors">
                  +91 80 6755 7777
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                <span>
                  21st KM, Kanakapura Road, Udayapura, Bangalore 560082
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter — glassmorphism */}
        <div className="py-8 border-t border-white/10">
          <div className="max-w-xl">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white/90 mb-2">
              Newsletter
            </h4>
            {subscribed ? (
              <p className="text-sm text-white/80">Thank you for subscribing.</p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2 flex-wrap">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    'flex-1 min-w-[200px] h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/50',
                    'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/30'
                  )}
                  aria-label="Newsletter email"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-11 px-6 rounded-lg font-medium"
                  style={{ backgroundColor: GOLD, color: '#1a1a2e' }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50 flex items-center gap-2">
            © {currentYear} Art of Living Foundation. Made with{' '}
            <Heart className="h-4 w-4 text-red-400 fill-red-400" /> for a stress-free world.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to="/privacy" className="hover:text-amber-400 transition-colors min-h-[44px] flex items-center">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors min-h-[44px] flex items-center">
              Terms
            </Link>
            <Link to="/sitemap" className="hover:text-amber-400 transition-colors min-h-[44px] flex items-center">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
