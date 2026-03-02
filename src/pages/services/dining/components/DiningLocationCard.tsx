/**
 * Dining - Location Card
 *
 * Card showing dining location details.
 */

import { Users, Clock, Utensils, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DiningLocation } from '../../types';

interface DiningLocationCardProps {
  location: DiningLocation;
}

const formatTimings = (timings: DiningLocation['timings']): string => {
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

export const DiningLocationCard = ({ location }: DiningLocationCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-2xl">{location.name}</CardTitle>
          <Badge variant={location.status === 'open' ? 'default' : 'secondary'}>
            {location.status}
          </Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed">{location.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location */}
        {location.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{location.location.name}</p>
              {location.location.directions && (
                <p className="text-muted-foreground text-xs mt-1">{location.location.directions}</p>
              )}
            </div>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Capacity: <span className="font-medium">{location.capacity} people</span>
          </span>
        </div>

        {/* Timings */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Today: <span className="font-medium">{formatTimings(location.timings)}</span>
          </span>
        </div>

        {/* Meal Types */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Meal Types:</p>
          <div className="flex flex-wrap gap-2">
            {location.mealTypes.map((meal) => (
              <Badge key={meal} variant="outline" className="text-xs">
                <Utensils className="h-3 w-3 mr-1" />
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Menu Philosophy */}
        <div className="pt-4 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Menu Philosophy:</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{location.menuPhilosophy}</p>
        </div>

        {/* Dietary Accommodations */}
        {location.dietaryAccommodations && location.dietaryAccommodations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Dietary Accommodations:</p>
            <ul className="space-y-1">
              {location.dietaryAccommodations.map((item, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
