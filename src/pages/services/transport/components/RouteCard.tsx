/**
 * Transport - Route Card
 *
 * Card showing route details and stops.
 */

import { MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Route } from '../../types';

interface RouteCardProps {
  route: Route;
}

export const RouteCard = ({ route }: RouteCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{route.name}</CardTitle>
          <Badge variant="outline">{route.type === 'ev-buggy' ? 'EV Buggy' : route.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stops */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Route Stops:</p>
          <div className="space-y-2">
            {route.stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-start gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{stop.name}</p>
                  {stop.location.name && (
                    <p className="text-xs text-muted-foreground">{stop.location.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timings */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Available Times:</p>
          <div className="flex flex-wrap gap-2">
            {route.timings.slice(0, 6).map((timing) => (
              <Badge
                key={timing.time}
                variant={timing.available ? 'outline' : 'secondary'}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {timing.time}
              </Badge>
            ))}
            {route.timings.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{route.timings.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Capacity: <span className="font-medium">{route.capacity} passengers</span>
          </span>
        </div>

        {/* Frequency */}
        {route.frequency && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Frequency: <span className="font-medium">Every {route.frequency} minutes</span>
            </span>
          </div>
        )}

        {/* Accessibility */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Accessibility:</p>
          <div className="flex flex-wrap gap-2">
            {route.accessibility.wheelchair && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Wheelchair Accessible
              </Badge>
            )}
            {route.accessibility.assistance && (
              <Badge variant="outline" className="text-xs">
                Assistance Available
              </Badge>
            )}
            {route.accessibility.specialNeeds && (
              <Badge variant="outline" className="text-xs">
                Special Needs Support
              </Badge>
            )}
          </div>
        </div>

        {/* Rules */}
        {route.rules && route.rules.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Important Notes:</p>
            <ul className="space-y-1">
              {route.rules.slice(0, 3).map((rule, idx) => (
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
  );
};
