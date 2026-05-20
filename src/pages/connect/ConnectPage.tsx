/**
 * Connect Page - Advanced Professional Design
 * 
 * A comprehensive care and support system with:
 * - Immersive hero section with real imagery
 * - Intent-based navigation ("How can we help you?")
 * - Quick action cards with real images
 * - Emergency visibility and support
 * - Time-aware contact options
 * - Professional, human-centered UI
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Search,
  Users,
  Heart,
  Headphones,
  Calendar,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { ChatTrigger } from '@/components/chatbot/ChatTrigger';

// Intent options for guided navigation
const supportIntents = [
  {
    id: 'visit',
    title: 'Planning a Visit',
    description: 'Information about visiting the ashram, accommodations, and programs',
    icon: MapPin,
    link: '/connect/contact',
    image: '/images/connect/card_contact_visit.jpg',
    color: 'bg-emerald-500',
  },
  {
    id: 'support',
    title: 'Get Support',
    description: 'Talk to our team about programs, registrations, or inquiries',
    icon: Headphones,
    link: '/connect/support',
    image: '/images/connect/card_contact_phone.jpg',
    color: 'bg-blue-500',
  },
  {
    id: 'faq',
    title: 'Quick Answers',
    description: 'Browse frequently asked questions and helpful resources',
    icon: HelpCircle,
    link: '/connect/faqs',
    image: '/images/connect/card_contact_faq.jpg',
    color: 'bg-purple-500',
  },
  {
    id: 'emergency',
    title: 'Emergency Assistance',
    description: '24/7 medical and emergency support on campus',
    icon: AlertTriangle,
    link: '/connect/contact#emergency',
    image: '/images/connect/card_contact_emergency.jpg',
    color: 'bg-red-500',
  },
];

// Quick contact methods
const contactMethods = [
  {
    id: 'phone',
    title: 'Call Us',
    value: '+91 80 6740 2400',
    description: 'Available 6:00 AM - 10:00 PM IST',
    icon: Phone,
    action: 'tel:+918067402400',
    image: '/images/connect/card_contact_phone.jpg',
  },
  {
    id: 'email',
    title: 'Email Us',
    value: 'info@artofliving.org',
    description: 'Response within 24 hours',
    icon: Mail,
    action: 'mailto:info@artofliving.org',
    image: '/images/connect/card_contact_email.jpg',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    value: '+91 98453 25000',
    description: 'Quick chat support',
    icon: MessageCircle,
    action: 'https://wa.me/919845325000',
    image: '/images/connect/card_contact_whatsapp.jpg',
  },
];

// Get current time-based greeting
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Check if within support hours
const isWithinSupportHours = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 22;
};

export const ConnectPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const [supportAvailable, setSupportAvailable] = useState(isWithinSupportHours());
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeGreeting());
      setSupportAvailable(isWithinSupportHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/connect/faqs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section with Real Image */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/connect/hero_connect_support.jpg"
            alt="Connect with us"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 container py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
              <Clock className="h-3 w-3 mr-1" />
              {supportAvailable ? 'Support Available Now' : 'Leave a Message'}
            </Badge>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4">
              {greeting}! <br />
              <span className="text-white/90">How Can We Help You?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              We're here to support your journey. Whether you're planning a visit, 
              have questions, or need assistance, our caring team is ready to help.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/95 border-0 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-6">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Intent-Based Navigation */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
              Choose Your Path
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select what best describes your needs, and we'll guide you to the right resources
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportIntents.map((intent, index) => (
              <motion.div
                key={intent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={intent.link}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={intent.image}
                        alt={intent.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className={`absolute top-4 left-4 p-2 rounded-lg ${intent.color}`}>
                        <intent.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {intent.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {intent.description}
                      </CardDescription>
                      <div className="flex items-center text-primary text-sm mt-4 font-medium">
                        Learn More
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
              Reach Out Directly
            </h2>
            <p className="text-muted-foreground text-lg">
              Multiple ways to connect with our support team
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <a href={method.action} target={method.id === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer">
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 overflow-hidden text-center">
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={method.image}
                        alt={method.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>
                    <CardContent className="pt-6 pb-8">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                        <method.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                      <p className="text-primary font-medium text-lg mb-1">{method.value}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
                Global Presence, Local Care
              </h2>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                With centers in over 180 countries and volunteers worldwide, 
                help is always within reach. Find your local Art of Living center 
                for personalized support and community connection.
              </p>
              <div className="flex flex-wrap gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-display font-light">180+</div>
                  <div className="text-sm opacity-80">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-display font-light">10K+</div>
                  <div className="text-sm opacity-80">Centers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-display font-light">500M+</div>
                  <div className="text-sm opacity-80">Lives Touched</div>
                </div>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/connect/contact">
                  <Globe className="h-5 w-5 mr-2" />
                  Find a Center Near You
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="/images/explore/card_global_impact.jpg"
                alt="Global presence"
                className="rounded-2xl shadow-2xl w-full"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Team Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
                Our Commitment to You
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every interaction is an opportunity to serve. Our volunteers and staff 
                are dedicated to providing warm, personalized support for your spiritual journey.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Clock, title: 'Responsive', description: 'Quick response times' },
                { icon: Users, title: 'Caring', description: 'Human-centered support' },
                { icon: Globe, title: 'Accessible', description: 'Multi-language help' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl bg-muted/50"
                >
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our comprehensive FAQ section covers most common inquiries. 
              If you can't find what you're looking for, our team is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Button size="lg" asChild>
                <Link to="/connect/faqs">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Browse FAQs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/connect/support">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Link>
              </Button>
              <ChatTrigger variant="button">Chat with us 💬</ChatTrigger>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ConnectPage;
