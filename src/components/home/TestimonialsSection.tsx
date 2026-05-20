import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const TESTIMONIALS_META = [
  {
    id: '1',
    author: 'Khurshed Batliwala',
    rating: 5,
    avatar: '/src/assets/testimonials/Khurshed-Batliwala.jpg',
  },
  {
    id: '2',
    author: 'Rajkumar Hirani',
    rating: 5,
    avatar: '/src/assets/testimonials/Rajkumar-Hirani.jpg',
  },
  {
    id: '3',
    author: 'Soumya kotha',
    rating: 5,
    avatar: 'src/assets/testimonials/Soumya-Kotha.jpg',
  },
  {
    id: '4',
    author: 'Krishna Bharadwaj',
    rating: 5,
    avatar: '/src/assets/testimonials/Krishna-Bharadwaj.jpg',
  },
];

export const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 hero-gradient">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            {t('home.testimonials.badge')}
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t('home.testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('home.testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS_META.map((testimonial, index) => {
            const quote = t(`home.testimonials.items.${testimonial.id}.quote`);
            const role = t(`home.testimonials.items.${testimonial.id}.role`);
            const program = t(`home.testimonials.items.${testimonial.id}.program`);
            const programKey = `home.testimonials.items.${testimonial.id}.program`;
            const hasProgram =
              program &&
              program !== programKey &&
              program.trim().length > 0;

            return (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-background/80 backdrop-blur-sm hover:shadow-elevated transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-foreground/90 mb-6 flex-1 leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {testimonial.author
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>

                  {/* Program Badge */}
                  {hasProgram && (
                    <Badge variant="secondary" className="mt-4 w-fit text-xs">
                      {program}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
