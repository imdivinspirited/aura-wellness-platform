import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Calendar, Users, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { VideoModal } from '@/components/ui/video-modal';
import { ROUTES } from '@/lib/routes';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleExplorePrograms = () => {
    navigate(ROUTES.PROGRAMS);
  };

  const handleWatchVideo = () => {
    setVideoModalOpen(true);
  };

  const handleRegisterNow = () => {
    // Global rule: same-tab by default
    window.location.href = ROUTES.REGISTRATION;
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero/hero_landing_ashram_mobile.jpg"
          srcSet="/images/hero/hero_landing_ashram_mobile.jpg 768w, /images/hero/hero_landing_ashram.jpg 1920w"
          sizes="100vw"
          alt="Art of Living Bangalore Ashram"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container py-20">
        <div className="max-w-2xl">
          {/* Live Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge
              className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 py-1.5 px-4"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live Event: Maha Shivaratri Celebrations
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            Discover Inner Peace at{' '}
            <span className="text-gradient-gold">Art of Living</span>{' '}
            Bangalore Ashram
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
          >
            Join millions worldwide in transformative yoga, meditation, and breathing programs.
            Experience ancient wisdom in a modern setting.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-8 mb-10"
          >
            <div>
              <p className="text-3xl font-display font-bold text-primary">500M+</p>
              <p className="text-sm text-muted-foreground">Lives Touched</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-primary">180+</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-primary">40+</p>
              <p className="text-sm text-muted-foreground">Years of Impact</p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="h-14 px-8 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-glow"
              onClick={handleExplorePrograms}
            >
              Explore Programs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-medium border-2"
              onClick={handleWatchVideo}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Video
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Floating Cards - Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 20 }}
        className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-20"
      >
        <Card className="w-80 glass-card shadow-xl-soft overflow-hidden">
          <div className="h-32 overflow-hidden">
            <img 
              src="/images/programs/card_program_beginner_happiness.jpg" 
              alt="Happiness Program"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Featured Event</span>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">
              Happiness Program
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn the Sudarshan Kriya and transform your life
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Jan 25 - Jan 28, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Bangalore Ashram</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>48 spots left</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="sm"
                onClick={handleRegisterNow}
              >
                Register Now
              </Button>
              <AddToCartButton
                itemId="happiness-program-featured"
                itemType="program"
                title="Happiness Program"
                subtitle="Learn the Sudarshan Kriya"
                metadata={{
                  dates: 'Jan 25 - Jan 28, 2026',
                  location: 'Bangalore Ashram',
                  duration: '3 Days',
                }}
                registrationUrl={ROUTES.REGISTRATION}
                variant="icon"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Modal */}
      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        title="Welcome to Art of Living"
        description="Discover the transformative power of yoga, meditation, and breathing techniques"
      />
    </section>
  );
};
