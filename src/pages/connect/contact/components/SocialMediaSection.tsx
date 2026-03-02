import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import type { SocialMedia } from '../data';
import { SmartLink } from '@/components/ui/SmartLink';

interface SocialMediaSectionProps {
  socialMedia: SocialMedia[];
}

export const SocialMediaSection = ({ socialMedia }: SocialMediaSectionProps) => {
  return (
    <section className="py-12" aria-labelledby="social-media-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle id="social-media-heading" className="text-2xl font-light">
            Follow Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {socialMedia.map((item, index) => {
              const IconComponent =
                (Icons as unknown as Record<string, React.ComponentType<any>>)[item.icon] || Icons.Link;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <SmartLink
                    to={item.url}
                    className="flex flex-col items-center gap-3 p-4 border border-stone-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                    aria-label={`Follow us on ${item.platform}`}
                  >
                    <IconComponent className="h-6 w-6 text-stone-600 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-stone-700 group-hover:text-primary transition-colors">
                      {item.platform}
                    </span>
                  </SmartLink>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
