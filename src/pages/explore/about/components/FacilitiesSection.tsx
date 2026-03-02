/**
 * About the Ashram - Facilities Section
 *
 * Grid layout showing ashram facilities with images and descriptions.
 */

import { motion } from 'framer-motion';
import { MapPin, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Facility } from '../../types';

interface FacilitiesSectionProps {
  facilities: Facility[];
}

const facilityTypeLabels: Record<Facility['type'], string> = {
  accommodation: 'Accommodation',
  meditation: 'Meditation',
  dining: 'Dining',
  garden: 'Garden',
  recreation: 'Recreation',
  other: 'Other',
};

export const FacilitiesSection = ({ facilities }: FacilitiesSectionProps) => {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Facilities & Spaces
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            World-class facilities designed to support your journey of transformation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow overflow-hidden">
                {facility.images && facility.images.length > 0 && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={facility.images[0]}
                      alt={facility.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-foreground">
                        {facilityTypeLabels[facility.type]}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {facility.name}
                    {facility.capacity && (
                      <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {facility.capacity}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{facility.description}</p>
                  {facility.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {facility.location}
                    </div>
                  )}
                  {facility.features && facility.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {facility.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                          >
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
