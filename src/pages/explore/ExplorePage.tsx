/**
 * Explore Page - Immersive Spiritual Discovery Experience
 * 
 * Features:
 * - Beautiful hero section with real imagery
 * - Intent-driven exploration sections
 * - Sacred Spaces, Wisdom Library, Global Impact
 * - Interactive journey selection
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Compass,
  BookOpen,
  Video,
  Users,
  MapPin,
  Heart,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ChatTrigger } from '@/components/chatbot/ChatTrigger';

// Explore sections with real images
const exploreSections = [
  {
    id: 'about',
    title: 'About the Ashram',
    description: 'Discover the history, vision, and sacred significance of this spiritual haven',
    icon: MapPin,
    link: '/explore/about',
    image: '/images/explore/card_explore_about.jpg',
    color: 'from-emerald-500/20',
  },
  {
    id: 'sacred-spaces',
    title: 'Sacred Spaces',
    description: 'Explore meditation halls, temples, and serene sanctuaries',
    icon: Sparkles,
    link: '/explore/about#spaces',
    image: '/images/explore/card_sacred_spaces.jpg',
    color: 'from-purple-500/20',
  },
  {
    id: 'daily-life',
    title: 'Life at the Ashram',
    description: 'Experience the rhythm of daily activities and spiritual practices',
    icon: Compass,
    link: '/explore/about#daily-life',
    image: '/images/explore/card_daily_life.jpg',
    color: 'from-orange-500/20',
  },
  {
    id: 'wisdom',
    title: 'Wisdom Library',
    description: 'Access teachings, articles, and spiritual knowledge',
    icon: BookOpen,
    link: '/explore/articles',
    image: '/images/explore/card_wisdom_library.jpg',
    color: 'from-amber-500/20',
  },
  {
    id: 'videos',
    title: 'Watch & Experience',
    description: 'Video discourses, guided meditations, and live satsangs',
    icon: Video,
    link: '/explore/videos',
    image: '/images/explore/card_watch_experience.jpg',
    color: 'from-blue-500/20',
  },
  {
    id: 'testimonials',
    title: 'Living Stories',
    description: 'Transformation stories and testimonials from seekers worldwide',
    icon: Heart,
    link: '/explore/testimonials',
    image: '/images/explore/card_living_stories.jpg',
    color: 'from-rose-500/20',
  },
  {
    id: 'mission',
    title: 'Our Mission',
    description: 'Understanding our purpose and global vision for peace',
    icon: Globe,
    link: '/explore/mission',
    image: '/images/explore/card_explore_mission.jpg',
    color: 'from-teal-500/20',
  },
  {
    id: 'impact',
    title: 'Global Impact',
    description: 'Humanitarian work, environmental initiatives, and service projects',
    icon: Users,
    link: '/explore/mission#impact',
    image: '/images/explore/card_global_impact.jpg',
    color: 'from-indigo-500/20',
  },
];

export const ExplorePage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/explore/hero_explore.jpg"
            alt="Explore the Ashram"
            className="h-full w-full object-cover"
            loading="eager"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src && !target.src.endsWith('/placeholder.svg')) {
                target.src = '/placeholder.svg';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 container py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8"
            >
              <Compass className="h-10 w-10 text-white" />
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
              Choose Your Journey
            </h1>

            <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl mx-auto">
              Explore the sacred spaces, timeless wisdom, and transformative experiences 
              that await you at the Art of Living International Center
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/explore/about">
                  <MapPin className="h-5 w-5 mr-2" />
                  Discover the Ashram
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/explore/videos">
                  <Video className="h-5 w-5 mr-2" />
                  Watch Videos
                </Link>
              </Button>
              <ChatTrigger
                variant="button"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Journey Selection Grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
              Explore Your Path
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each journey unfolds a new dimension of spiritual discovery
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exploreSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={section.link}>
                  <Card className="group h-full hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:-translate-y-1">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src && !target.src.endsWith('/placeholder.svg')) {
                            target.src = '/placeholder.svg';
                          }
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${section.color} to-transparent opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white">
                          <section.icon className="h-5 w-5" />
                          <h3 className="font-semibold text-lg">{section.title}</h3>
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-4 pb-6">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium">
                        Explore
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Quote Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="text-6xl mb-8 opacity-50">"</div>
            <blockquote className="font-display text-2xl md:text-3xl font-light leading-relaxed mb-8">
              When you are in silence, you don't just listen to the words, 
              you also listen to the spaces between the words. 
              And that's where real wisdom is.
            </blockquote>
            <cite className="text-lg opacity-80">— Gurudev Sri Sri Ravi Shankar</cite>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
              Ready to Experience It Yourself?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands who have transformed their lives through our programs 
              and retreats at the ashram
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/programs">
                  Browse Programs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/connect">
                  Plan Your Visit
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fixed floating chatbot trigger — bottom right */}
      <div
        className="fixed bottom-24 right-4 z-[100] md:bottom-6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <ChatTrigger
          variant="button"
          className="shadow-lg rounded-full h-14 w-14 p-0 gap-0"
        >
          💬
        </ChatTrigger>
      </div>
    </MainLayout>
  );
};

export default ExplorePage;
