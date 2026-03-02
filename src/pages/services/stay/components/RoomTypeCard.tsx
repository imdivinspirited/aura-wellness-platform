/**
 * Stay & Meals - Room Type Card
 *
 * Detailed room type card with pricing and amenities.
 */

import { Users, MapPin, CheckCircle2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Room } from '../../types';

interface RoomTypeCardProps {
  room: Room;
  onBook?: (room: Room) => void;
}

export const RoomTypeCard = ({ room, onBook }: RoomTypeCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          category="stay"
          src={room.images?.[0]}
          alt={room.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary">
            {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-2xl">{room.name}</CardTitle>
        <p className="text-muted-foreground leading-relaxed mt-2">{room.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Capacity: <span className="font-medium">{room.maxGuests} {room.maxGuests === 1 ? 'guest' : 'guests'}</span>
          </span>
        </div>

        {/* Location */}
        {room.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{room.location.name}</p>
              {room.location.building && (
                <p className="text-muted-foreground text-xs">
                  {room.location.building}
                  {room.location.floor && `, ${room.location.floor}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">Pricing Options:</p>
          <div className="space-y-2">
            {room.pricing.map((price) => (
              <div key={price.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{price.name}</p>
                  <p className="font-bold text-primary">
                    {price.currency} {price.contribution}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{price.description}</p>
                {price.conditions && (
                  <ul className="space-y-1">
                    {price.conditions.map((condition, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {room.eligibility && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2 text-xs">
              {room.eligibility.familyFriendly && (
                <Badge variant="outline" className="text-xs">Family Friendly</Badge>
              )}
              {room.eligibility.specialNeeds && (
                <Badge variant="outline" className="text-xs">Special Needs Accessible</Badge>
              )}
            </div>
          </div>
        )}

        {/* Book Button */}
        {onBook && (
          <Button onClick={() => onBook(room)} className="w-full mt-4">
            <Calendar className="mr-2 h-4 w-4" />
            Book This Room
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
