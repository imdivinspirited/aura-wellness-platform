import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const testimonials = [
  { name: 'James P.', country: '🇬🇧 UK', text: 'I came as a skeptic and left as a believer. The Sudarshan Kriya literally changed my brain chemistry. 6 months later, I\'m still meditating daily.', rating: 5 },
  { name: 'Yuki T.', country: '🇯🇵 Japan', text: 'The silence retreat was the most profound experience of my life. The ashram is beautifully maintained and the staff is incredibly welcoming to foreigners.', rating: 5 },
  { name: 'Maria S.', country: '🇪🇸 Spain', text: 'I was worried about the food and hygiene, but everything exceeded my expectations. The vegetarian meals were delicious and the rooms were clean.', rating: 5 },
  { name: 'David L.', country: '🇨🇦 Canada', text: 'Best investment I\'ve ever made in myself. The happiness program gave me tools I use every single day. My team at work even noticed the change.', rating: 5 },
  { name: 'Anna K.', country: '🇸🇪 Sweden', text: 'Coming from Sweden, I was worried about the heat. But the ashram grounds are so green and peaceful. November–February is perfect weather.', rating: 4 },
  { name: 'Chen W.', country: '🇸🇬 Singapore', text: 'Third time visiting. Each time I discover something deeper. This place has become my annual reset button.', rating: 5 },
];

const flags = ['🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇦🇺', '🇨🇦', '🇯🇵', '🇰🇷', '🇸🇬', '🇧🇷', '🇮🇹', '🇪🇸', '🇸🇪', '🇳🇱', '🇨🇭', '🇵🇹', '🇲🇽', '🇦🇷', '🇿🇦', '🇳🇿'];

export function IntlTestimonials() {
  const [current, setCurrent] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(testimonials.length / perPage);

  return (
    <section className="py-20 bg-card">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Global Community</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">
            Trusted by Visitors Worldwide
          </h2>
          <div className="flex justify-center gap-1 text-2xl flex-wrap max-w-md mx-auto mb-4">
            {flags.map((f, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                {f}
              </motion.span>
            ))}
          </div>
          <p className="text-muted-foreground">Visitors from 180+ countries. Here's what they say.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(current * perPage, (current + 1) * perPage).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-background p-6 space-y-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" size="icon" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pages }).map((_, i) => (
              <Button
                key={i}
                variant={i === current ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrent(i)}
                className="w-8 h-8 text-xs"
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => setCurrent(Math.min(pages - 1, current + 1))} disabled={current === pages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
