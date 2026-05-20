/**
 * Facilities - Facility Card
 *
 * Card showing facility details.
 */

import { MapPin, Clock, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Facility } from '../../types';

interface FacilityCardProps {
  facility: Facility;
}

const categoryLabels: Record<Facility['category'], string> = {
  essential: 'Essential Service',
  convenience: 'Convenience',
  special: 'Special Facility',
  emergency: 'Emergency',
};

const formatTimings = (timings: Facility['timings'], operatingHours: Facility['operatingHours']): string => {
  if (operatingHours === '24/7') {
    return '24/7 Available';
  }
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

export const FacilityCard = ({ facility }: FacilityCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{facility.name}</CardTitle>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[facility.category]}
            </Badge>
            {facility.emergency && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Emergency
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{facility.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location */}
        {facility.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{facility.location.name}</p>
              {facility.location.building && (
                <p className="text-muted-foreground text-xs">
                  {facility.location.building}
                  {facility.location.floor && `, ${facility.location.floor}`}
                </p>
              )}
              {facility.location.directions && (
                <p className="text-muted-foreground text-xs italic mt-1">
                  {facility.location.directions}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatTimings(facility.timings, facility.operatingHours)}
          </span>
        </div>

        {/* Capacity */}
        {facility.capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Capacity: <span className="font-medium">{facility.capacity} people</span>
            </span>
          </div>
        )}

        {/* Accessibility */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Accessibility:</p>
          <div className="flex flex-wrap gap-2">
            {facility.accessibility.wheelchair && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Wheelchair Accessible
              </Badge>
            )}
            {facility.accessibility.visual && (
              <Badge variant="outline" className="text-xs">Visual Support</Badge>
            )}
            {facility.accessibility.assistance && (
              <Badge variant="outline" className="text-xs">Assistance Available</Badge>
            )}
          </div>
        </div>

        {/* Contact */}
        {facility.contact && (
          <div className="pt-4 border-t">
            <a
              href={`tel:${facility.contact.phone}`}
              className="text-sm text-primary hover:underline"
            >
              {facility.contact.phone}
              {facility.contact.extension && (
                <span className="text-muted-foreground"> ext. {facility.contact.extension}</span>
              )}
            </a>
          </div>
        )}

        {/* Rules */}
        {facility.rules && facility.rules.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Guidelines:</p>
            <ul className="space-y-1">
              {facility.rules.map((rule, idx) => (
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
