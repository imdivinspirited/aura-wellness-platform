import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProgramsSubNav } from '@/components/programs/ProgramsSubNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES, getProgramsRouteWithCategory } from '@/lib/routes';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Leaf, Mountain, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const programs = [
  {
    id: 'happiness',
    title: 'Happiness Program',
    description:
      'Learn the powerful Sudarshan Kriya breathing technique to release stress and feel energized.',
    image: '/images/navitem-listing/happiness-program.jpg', // ✅ IMAGE PATH
    icon: Sparkles,
    level: 'Beginner',
    duration: '3 Days',
    mode: 'Online & Offline',
    color: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'silence',
    title: 'Silence Retreat',
    description:
      'Experience profound silence and deepen your meditation practice in a serene environment.',
    icon: Mountain,
    level: 'Intermediate',
    duration: '3-5 Days',
    mode: 'Residential',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-600',
  },
  {
    id: 'yoga',
    title: 'Sri Sri Yoga',
    description:
      'Traditional yoga practices combining asanas, pranayama, and meditation for holistic wellness.',
    icon: Leaf,
    level: 'All Levels',
    duration: 'Ongoing',
    mode: 'Online & Offline',
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-600',
  },
  {
    id: 'advanced',
    title: 'Advanced Programs',
    description: 'Go deeper into meditation and unlock higher states of consciousness.',
    icon: Heart,
    level: 'Advanced',
    duration: '4-7 Days',
    mode: 'Residential',
    color: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-600',
  },
];

export const FeaturedProgramsSection = () => {
  const navigate = useNavigate();

  const handleLearnMore = (programId: string) => {
    const routeMap: Record<string, string> = {
      happiness: ROUTES.PROGRAM_HAPPINESS,
      silence: ROUTES.PROGRAM_SILENCE,
      yoga: ROUTES.PROGRAM_YOGA,
      advanced: ROUTES.PROGRAMS_ADVANCED,
    };
    navigate(routeMap[programId] || ROUTES.PROGRAMS);
  };

  const handleExploreAll = () => {
    navigate(ROUTES.PROGRAMS);
    setTimeout(() => {
      const section = document.getElementById('programs-listing');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategoryClick = (category: string) => {
    navigate(getProgramsRouteWithCategory(category));
  };

  return (
    <section className="py-20">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Transform Your Life
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Programs for Every Stage of Your Journey
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From beginners to advanced practitioners, find the perfect program to deepen your
            practice and transform your life.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {programs.map((program, index) => {
            const Icon = program.icon;

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full overflow-hidden hover:shadow-elevated transition-all duration-300">
                  {/* ✅ IMAGE (ONLY HAPPINESS HAS IT) */}
                  {program.image && (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={program.image}
                        alt={program.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-7 w-7 ${program.iconColor ?? ''}`} />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-semibold mb-2">{program.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {program.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {program.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {program.duration}
                      </Badge>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="flex-1 justify-between"
                        onClick={() => handleLearnMore(program.id)}
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <AddToCartButton
                        itemId={`program-${program.id}`}
                        itemType="program"
                        title={program.title}
                        subtitle={program.description}
                        metadata={{
                          level: program.level,
                          duration: program.duration,
                          mode: program.mode,
                        }}
                        variant="icon"
                        size="sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" onClick={handleExploreAll}>
            Explore All Programs
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Sub Nav */}
      <div className="mt-16">
        <ProgramsSubNav onItemClick={handleCategoryClick} />
      </div>
    </section>
  );
};
