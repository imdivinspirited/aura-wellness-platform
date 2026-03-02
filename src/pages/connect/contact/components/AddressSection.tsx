import { motion } from 'framer-motion';
import { MapPin, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Address } from '../data';

interface AddressSectionProps {
  address: Address;
}

export const AddressSection = ({ address }: AddressSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section className="py-12" aria-labelledby="address-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <CardTitle id="address-heading" className="text-2xl font-light">
              Full Address
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-display text-lg font-medium mb-2 text-stone-900">
                {address.name}
              </h3>
              <address className="text-stone-700 leading-relaxed not-italic">
                {address.street}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.country}
              </address>
            </div>
            <div className="pt-4 border-t border-stone-200">
              <p className="text-sm text-muted-foreground mb-2">Full Address:</p>
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                <p className="flex-1 text-stone-700 leading-relaxed">{address.fullAddress}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 flex-shrink-0"
                  aria-label="Copy full address"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
};
