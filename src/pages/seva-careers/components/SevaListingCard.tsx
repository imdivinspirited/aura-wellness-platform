import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Briefcase, GraduationCap } from 'lucide-react';
import type { SevaListing, ListingType } from '../data/listings';

const typeConfig: Record<ListingType, { label: string; icon: typeof Heart }> = {
  seva: { label: 'Seva', icon: Heart },
  job: { label: 'Job', icon: Briefcase },
  internship: { label: 'Internship', icon: GraduationCap },
};

export interface SevaListingCardProps {
  listing: SevaListing;
  onApply: (listing: SevaListing) => void;
}

export function SevaListingCard({ listing, onApply }: SevaListingCardProps) {
  const { label, icon: Icon } = typeConfig[listing.type];
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight">{listing.title}</h3>
          <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.department} · {listing.duration}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <span className="font-medium text-foreground">Location:</span> {listing.location}
        </p>
        {listing.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{listing.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={() => onApply(listing)} className="w-full sm:w-auto">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
}
