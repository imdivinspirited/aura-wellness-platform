import { motion } from 'framer-motion';
import { Bus, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransportInfo } from '../data';

interface TransportInfoProps {
  data: TransportInfo;
}

export const TransportInfoSection = ({ data }: TransportInfoProps) => {
  return (
    <section className="py-12" aria-labelledby="transport-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle id="transport-heading" className="text-2xl font-light">
                {data.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.details.map((detail, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <span className="text-stone-700 leading-relaxed">{detail}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};
