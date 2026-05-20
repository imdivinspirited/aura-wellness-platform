import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProgramsSubNav } from '@/components/programs/ProgramsSubNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES, getProgramsRouteWithCategory } from '@/lib/routes';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROGRAM_IDS = ['happiness', 'silence', 'yoga', 'advanced'] as const;

const programImages: Record<(typeof PROGRAM_IDS)[number], string> = {
  happiness: '/images/programs/card_program_beginner_happiness.jpg',
  silence: '/images/programs/card_program_silence_retreat.jpg',
  yoga: '/images/programs/card_program_yoga_class.jpg',
  advanced: '/images/programs/card_program_advanced_meditation.jpg',
};

const routeMap: Record<string, string> = {
  happiness: ROUTES.PROGRAM_HAPPINESS,
  silence: ROUTES.PROGRAM_SILENCE,
  yoga: ROUTES.PROGRAM_YOGA,
  advanced: ROUTES.PROGRAMS_ADVANCED,
};

export const FeaturedProgramsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLearnMore = (programId: string) => {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary">{t('home.featured.badge')}</Badge>
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">{t('home.featured.title')}</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t('home.featured.subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROGRAM_IDS.map((programId, index) => {
            const base = `home.featured.programs.${programId}`;
            const title = t(`${base}.title`);
            const description = t(`${base}.description`);
            const level = t(`${base}.level`);
            const duration = t(`${base}.duration`);
            const mode = t(`${base}.mode`);

            return (
              <motion.div
                key={programId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-elevated">
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={programImages[programId]}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <CardContent className="flex flex-col p-6">
                    <h3 className="mb-2 font-display text-xl font-semibold">{title}</h3>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {duration}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="flex-1 justify-between"
                        onClick={() => handleLearnMore(programId)}
                      >
                        {t('home.featured.learnMore')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                      <AddToCartButton
                        itemId={`program-${programId}`}
                        itemType="program"
                        title={title}
                        subtitle={description}
                        metadata={{
                          level,
                          duration,
                          mode,
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button size="lg" variant="outline" onClick={handleExploreAll}>
            {t('home.featured.exploreAll')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      <div className="mt-16">
        <ProgramsSubNav onItemClick={handleCategoryClick} />
      </div>
    </section>
  );
};
