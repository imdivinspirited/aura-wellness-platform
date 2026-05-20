import { motion } from 'framer-motion';
import { Heart, Globe, Users, Leaf, Target, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const VALUE_CONFIG: {
  key: 'service' | 'globalPeace' | 'community' | 'sustainability';
  icon: typeof Heart;
  image: string;
}[] = [
  {
    key: 'service',
    icon: Heart,
    image: '/images/home/card_value_service.jpg',
  },
  {
    key: 'globalPeace',
    icon: Globe,
    image: '/images/home/card_value_peace.jpg',
  },
  {
    key: 'community',
    icon: Users,
    image: '/images/home/card_value_community.jpg',
  },
  {
    key: 'sustainability',
    icon: Leaf,
    image: '/images/home/card_value_sustainability.jpg',
  },
];

const STAT_KEYS = ['livesTouched', 'countries', 'yearsService', 'volunteers'] as const;
const STAT_VALUES = ['500M+', '180+', '40+', '800K+'] as const;

export const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-card">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('home.mission.missionEyebrow')}
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t('home.mission.missionTitle')}
            </h2>

            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {t('home.mission.missionBody')}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">
                {t('home.mission.visionEyebrow')}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {t('home.mission.visionBody')}
            </p>
          </motion.div>

          {/* Values Grid with Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {VALUE_CONFIG.map((value, index) => {
              const Icon = value.icon;
              const title = t(`home.mission.values.${value.key}.title`);
              const description = t(`home.mission.values.${value.key}.description`);
              return (
                <motion.div
                  key={value.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl bg-background border border-border hover:shadow-soft transition-all duration-300 group overflow-hidden"
                >
                  {/* Image */}
                  <div className="h-28 overflow-hidden">
                    <img
                      src={value.image}
                      alt={title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-base font-semibold mb-1">
                      {title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Impact Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {STAT_KEYS.map((statKey, index) => (
            <motion.div
              key={statKey}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6"
            >
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                {STAT_VALUES[index]}
              </p>
              <p className="text-muted-foreground">
                {t(`home.mission.stats.${statKey}`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
