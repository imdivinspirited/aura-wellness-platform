/**
 * Shopping - Shop Card
 *
 * Detailed shop card with all information.
 */

import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shop } from '../../types';

interface ShopCardProps {
  shop: Shop;
}

const categoryLabels: Record<Shop['category'], string> = {
  bookstore: 'Bookstore',
  ayurveda: 'Ayurveda & Wellness',
  souvenirs: 'Souvenirs & Gifts',
  clothing: 'Clothing & Accessories',
  spiritual: 'Spiritual Items',
  other: 'Other',
};

const formatTimings = (timings: Shop['timings']): string => {
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayKey = weekday as keyof typeof timings;
  const todayTiming = timings[todayKey];

  if (typeof todayTiming === 'string') {
    return todayTiming;
  }

  if (todayTiming && typeof todayTiming === 'object' && 'open' in todayTiming && 'close' in todayTiming) {
    return `${todayTiming.open} - ${todayTiming.close}`;
  }

  return 'Check timings';
};

export const ShopCard = ({ shop }: ShopCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
        {shop.images && shop.images.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={shop.images[0]}
              alt={shop.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary">{categoryLabels[shop.category]}</Badge>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">{shop.name}</CardTitle>
          <p className="text-muted-foreground leading-relaxed mt-2">{shop.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          {shop.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{shop.location.name}</p>
                {shop.location.building && (
                  <p className="text-muted-foreground text-xs">
                    {shop.location.building}
                    {shop.location.floor && `, ${shop.location.floor}`}
                  </p>
                )}
                {shop.location.directions && (
                  <p className="text-muted-foreground text-xs italic mt-1">
                    {shop.location.directions}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timings */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Today: <span className="font-medium">{formatTimings(shop.timings)}</span>
            </span>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Price Range: <span className="font-medium">
                {shop.priceRange.currency} {shop.priceRange.min} - {shop.priceRange.max}
              </span>
            </span>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Payment Methods:</p>
            <div className="flex flex-wrap gap-2">
              {shop.paymentMethods.map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Special Items */}
          {shop.specialItems && shop.specialItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Special Items:</p>
              <div className="flex flex-wrap gap-2">
                {shop.specialItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {shop.contact && (
            <div className="pt-4 border-t">
              <a
                href={`tel:${shop.contact.phone}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {shop.contact.phone}
                {shop.contact.extension && (
                  <span className="text-muted-foreground">ext. {shop.contact.extension}</span>
                )}
              </a>
            </div>
          )}

          {/* Rules */}
          {shop.rules && shop.rules.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Notes:</p>
              <ul className="space-y-1">
                {shop.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
