import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    quote: 'Sudarshan Kriya Yoga Made a Big Difference in My Life',
    author: 'Khurshed Batliwala',
    role: '54  Trainer, Master In Mathematics, IIT Mumbai',
    program: 'Sudarshan Kriya',
    rating: 5,
    avatar: '/src/assets/testimonials/Khurshed-Batliwala.jpg',
  },
  {
    id: '2',
    quote: 'Re-energizes me and my crew',
    author: 'Rajkumar Hirani',
    role: 'Bollywood Filmmaker, Mumbai',
    program: 'Silence Retreat',
    rating: 5,
    avatar: '/src/assets/testimonials/Rajkumar-Hirani.jpg',
  },
  {
    id: '3',
    quote:
      'Getting into an absolute state of silence is what I experienced through Sahaj. Never knew a mantra can have such a huge impact until I experienced it personally!',
    author: 'Soumya kotha',
    role: 'Recruitment specialist',
    program: '',
    rating: 5,
    avatar: 'src/assets/testimonials/Soumya-Kotha.jpg',
  },
  {
    id: '4',
    quote: 'Came out of depression',
    author: 'Krishna Bharadwaj',
    role: 'Television actor',
    program: '',
    rating: 5,
    avatar: 'src/assets/testimonials/Krishna-Bharadwaj.jpg',
  },
];

export const TestimonialsSection = () => {
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
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Real Stories</Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join millions who have transformed their lives through our programs
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
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
                    "{testimonial.quote}"
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
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Program Badge */}
                  <Badge variant="secondary" className="mt-4 w-fit text-xs">
                    {testimonial.program}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
