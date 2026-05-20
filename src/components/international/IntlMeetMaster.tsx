import { motion } from 'framer-motion';
import { Quote, ExternalLink } from 'lucide-react';

export function IntlMeetMaster() {
  return (
    <section className="py-20 bg-card">
      <div className="container max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden shadow-elevated">
              <img
                src="/images/programs/intl_master.jpg"
                alt="Gurudev Sri Sri Ravi Shankar"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={1000}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Meet the Founder</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Gurudev Sri Sri Ravi Shankar
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A global humanitarian, spiritual leader, and peace envoy — Gurudev has touched over 500 million lives across 180+ countries. His vision: a stress-free mind and violence-free world.
              </p>
              <p>
                He has been nominated for the Nobel Peace Prize multiple times and has received 20+ honorary doctorates from universities worldwide.
              </p>
            </div>

            <blockquote className="border-l-4 border-primary pl-6 py-2">
              <Quote className="h-5 w-5 text-primary mb-2" />
              <p className="italic text-foreground/80 font-display text-lg">
                "The purpose of knowledge is to bring a smile that doesn't wither away."
              </p>
            </blockquote>

            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-2xl font-display font-bold text-primary">180+</p>
                <p className="text-muted-foreground">Countries Visited</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-primary">500M+</p>
                <p className="text-muted-foreground">Lives Touched</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-primary">20+</p>
                <p className="text-muted-foreground">Honorary Doctorates</p>
              </div>
            </div>

            <a
              href="https://www.srisriravishankar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Learn more about Gurudev <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
