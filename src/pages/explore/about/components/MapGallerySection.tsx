/**
 * About the Ashram - Map & Gallery Section
 *
 * Interactive map and photo gallery.
 */

import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeImage } from '@/components/ui/SafeImage';
import { SmartLink } from '@/components/ui/SmartLink';

// Lazy load map component
const MapSection = lazy(() => import('@/pages/connect/contact/components/MapSection').then(m => ({ default: m.MapSection })));

interface MapGallerySectionProps {
  mapLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export const MapGallerySection = ({ mapLocation }: MapGallerySectionProps) => {
  const [showMap, setShowMap] = useState(false);

  // Placeholder gallery images - in production, these would come from data
  const galleryImages = [
    '/images/ashram/gallery-1.jpg',
    '/images/ashram/gallery-2.jpg',
    '/images/ashram/gallery-3.jpg',
    '/images/ashram/gallery-4.jpg',
    '/images/ashram/gallery-5.jpg',
    '/images/ashram/gallery-6.jpg',
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Visit Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the ashram in person or explore through our gallery
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 border-b">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-2xl font-bold">Location</h3>
                </div>
                <p className="text-muted-foreground mb-4">{mapLocation.address}</p>
                <Button
                  onClick={() => setShowMap(!showMap)}
                  variant="outline"
                  className="w-full"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </Button>
              </div>
              {showMap && (
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <div className="h-96">
                    <MapSection
                      lat={mapLocation.lat}
                      lng={mapLocation.lng}
                      zoom={15}
                      address={mapLocation.address}
                    />
                  </div>
                </Suspense>
              )}
            </CardContent>
          </Card>

          {/* Gallery Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-display text-2xl font-bold">Photo Gallery</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                  >
                    <SafeImage
                      category="explore"
                      src={image}
                      alt={`Ashram gallery ${index + 1}`}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6" asChild>
                <SmartLink to="/explore/videos">
                  View Virtual Tour
                  <ExternalLink className="ml-2 h-4 w-4" />
                </SmartLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
