import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/ui/SmartLink';

interface MapSectionProps {
  lat: number;
  lng: number;
  zoom: number;
  address: string;
}

export const MapSection = ({ lat, lng, zoom, address }: MapSectionProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${zoom}!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  useEffect(() => {
    // Lazy load map
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-12" aria-labelledby="map-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle id="map-heading" className="text-2xl font-light">
                Location Map
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:flex"
            >
              <SmartLink to={googleMapsUrl} aria-label="Open in Google Maps">
                Open in Maps
                <ExternalLink className="ml-2 h-4 w-4" />
              </SmartLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-stone-200"
          >
            {mapLoaded ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Art of Living International Center Location"
                aria-label="Interactive map showing Art of Living International Center location"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">Loading map...</p>
                </div>
              </div>
            )}
          </motion.div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{address}</p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="md:hidden"
            >
              <SmartLink to={googleMapsUrl} aria-label="Open in Google Maps">
                Open Maps
                <ExternalLink className="ml-2 h-4 w-4" />
              </SmartLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
