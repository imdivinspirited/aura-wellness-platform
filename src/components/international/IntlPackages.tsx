import { motion } from 'framer-motion';
import { Check, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const packages = [
  {
    name: 'Explorer',
    duration: '3 Days',
    price: 150,
    popular: false,
    features: [
      'Daily yoga & meditation',
      'All meals included',
      'Ashram tour',
      'Standard accommodation',
      'Certificate of completion',
    ],
  },
  {
    name: 'Signature Retreat',
    duration: '5 Days',
    price: 350,
    popular: true,
    features: [
      'Sudarshan Kriya workshop',
      'Advanced meditation sessions',
      'All meals + herbal teas',
      'Premium accommodation',
      'Airport pickup included',
      'Personal wellness consultation',
      'Certificate of completion',
    ],
  },
  {
    name: 'Deep Transformation',
    duration: '10 Days',
    price: 600,
    popular: false,
    features: [
      'Complete program bundle',
      'Silence retreat included',
      'All meals + Ayurvedic diet',
      'Premium suite',
      'Airport transfers',
      'Personal yoga sessions',
      'Lifetime community access',
      'Follow-up support',
    ],
  },
];

export function IntlPackages() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Packages</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Choose Your Journey
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            All-inclusive packages designed for international visitors. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 space-y-6 ${
                pkg.popular
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'bg-card'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg.duration}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-primary">${pkg.price}</span>
                <span className="text-muted-foreground text-sm">/person</span>
              </div>

              <ul className="space-y-3">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${pkg.popular ? '' : 'bg-foreground/10 text-foreground hover:bg-foreground/20'}`}
                variant={pkg.popular ? 'default' : 'outline'}
                onClick={() => window.open('https://programs.vvmvp.org/', '_blank')}
              >
                Book Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            💳 Secure payments via Stripe. All major cards accepted. 🔒 SSL encrypted.
          </p>
          <p className="text-sm text-muted-foreground">
            📧 Full refund available up to 7 days before program start date.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
