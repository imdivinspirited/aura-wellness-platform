import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter, Linkedin } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

// Social media URLs (replace with actual URLs)
const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/artofliving',
  facebook: 'https://www.facebook.com/artofliving',
  youtube: 'https://www.youtube.com/artofliving',
  twitter: 'https://twitter.com/artofliving',
  linkedin: 'https://www.linkedin.com/company/artofliving',
} as const;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-foundation text-muted">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logos/aolic_logo.png"
                alt="Art of Living Logo"
                className="h-10 w-auto object-contain block dark:hidden"
                style={{
                  minWidth: '40px',
                  maxHeight: '40px',
                }}
              />
              <img
                src="/images/logos/aolic_logo_white.png"
                alt="Art of Living Logo"
                className="h-10 w-auto object-contain hidden dark:block"
                style={{
                  minWidth: '40px',
                  maxHeight: '40px',
                }}
              />
              <div>
                <h3 className="font-display text-lg font-semibold text-background/90">Art of Living</h3>
                <p className="text-xs text-background/60">Bangalore Ashram</p>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              A global movement for peace, well-being, and a stress-free society through breath, meditation, and service.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SOCIAL_LINKS.instagram}
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4 text-background/80" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-4 w-4 text-background/80" />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="h-4 w-4 text-background/80" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-4 w-4 text-background/80" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-background/80" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-background/90">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/programs" className="hover:text-primary transition-colors">Programs</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Explore</Link></li>
              <li><Link to="/connect/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-background/90">Support</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/connect/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/connect/support" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/explore/visitor-guide" className="hover:text-primary transition-colors">Visitor Guide</Link></li>
              <li><Link to="/connect/centers" className="hover:text-primary transition-colors">Find a Center</Link></li>
            </ul>
          </div>

          {/* Get the App */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold text-background/90">Get the App</h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
          <p className="text-sm text-background/60">
            © {currentYear} Art of Living Foundation. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-background/60">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
