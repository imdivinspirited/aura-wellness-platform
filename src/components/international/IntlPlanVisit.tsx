import { motion } from 'framer-motion';
import { Plane, Car, MapPin, FileText, Clock, Shield } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Visa',
    description: 'Most nationalities can get an e-Visa online in 3–5 days. We provide invitation letters if needed.',
    tip: 'Apply for "Tourist Visa" — valid for 30/90 days',
  },
  {
    icon: Plane,
    title: 'Fly to Bangalore (BLR)',
    description: 'Kempegowda International Airport (BLR) is well-connected globally. Direct flights from most major cities.',
    tip: 'Airlines: Emirates, Singapore Air, Lufthansa, United',
  },
  {
    icon: Car,
    title: 'Airport to Ashram',
    description: 'The ashram is ~45 minutes from BLR airport. We arrange pickup for international visitors.',
    tip: 'Pre-book ashram shuttle or use Uber/Ola app',
  },
  {
    icon: MapPin,
    title: 'Arrive & Check-in',
    description: '21st Km, Kanakapura Road, Udayapura. Check-in is smooth — just bring your booking confirmation.',
    tip: 'Check-in time: 2 PM | Check-out: 11 AM',
  },
];

export function IntlPlanVisit() {
  return (
    <section className="py-20">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Getting Here</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4">
            Plan Your Visit
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know to get from your doorstep to inner peace
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  i % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                  <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-2">{step.description}</p>
                  <p className="text-sm text-primary font-medium">💡 {step.tip}</p>
                </div>

                <div className="relative z-10 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow flex-shrink-0">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl overflow-hidden border shadow-soft"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.9!2d77.499!3d12.791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae4067e7f9505d%3A0x8c3b9aef9f5f3c5f!2sArt%20of%20Living%20International%20Center!5e0!3m2!1sen!4v1"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Art of Living Ashram Location"
          />
        </motion.div>
      </div>
    </section>
  );
}
