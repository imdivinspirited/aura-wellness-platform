/**
 * Donation Section Component
 * 
 * Supports Google Pay, PhonePe, UPI ID, QR Code, and Mobile Number.
 * All values are editable from admin UI (future-proof).
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Copy, 
  Check,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DonationSectionProps {
  eventId: string;
  eventTitle: string;
}

// Default donation config (in production, this would come from admin/API)
const DEFAULT_DONATION_CONFIG = {
  googlePay: {
    enabled: true,
    number: '+91 9876543210',
    upiId: 'artofliving@paytm',
  },
  phonePe: {
    enabled: true,
    number: '+91 9876543210',
    upiId: 'artofliving@ybl',
  },
  upi: {
    enabled: true,
    upiId: 'artofliving@paytm',
  },
  qrCode: {
    enabled: true,
    imageUrl: '/images/donation/qr-code.jpg', // Placeholder
  },
  mobileNumber: {
    enabled: true,
    number: '+91 9876543210',
  },
};

export function DonationSection({ eventId, eventTitle }: DonationSectionProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState('');

  // In production, load from admin config
  const config = DEFAULT_DONATION_CONFIG;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copied!',
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy manually',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = (method: 'googlepay' | 'phonepe') => {
    const upiId = method === 'googlepay' ? config.googlePay.upiId : config.phonePe.upiId;
    const amount = donationAmount || '100';
    
    // Create UPI payment URL
    const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Donation for ${eventTitle}`;
    
    // Try to open payment app
    window.location.href = upiUrl;
    
    toast({
      title: 'Opening payment app...',
      description: `Opening ${method === 'googlepay' ? 'Google Pay' : 'PhonePe'}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Support This Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Donation Amount Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Donation Amount (₹)</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            min="1"
          />
        </div>

        {/* Google Pay */}
        {config.googlePay.enabled && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handlePayment('googlepay')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Google Pay
          </Button>
        )}

        {/* PhonePe */}
        {config.phonePe.enabled && (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handlePayment('phonepe')}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            PhonePe
          </Button>
        )}

        {/* UPI ID */}
        {config.upi.enabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">UPI ID</label>
            <div className="flex gap-2">
              <Input
                value={config.upi.upiId}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy(config.upi.upiId, 'UPI ID')}
              >
                {copiedField === 'UPI ID' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* QR Code */}
        {config.qrCode.enabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Scan QR Code</label>
            <div className="border rounded-lg p-4 flex items-center justify-center bg-muted/50">
              {config.qrCode.imageUrl ? (
                <img
                  src={config.qrCode.imageUrl}
                  alt="Donation QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="flex flex-col items-center gap-2 text-muted-foreground">
                        <QrCode class="h-16 w-16" />
                        <p class="text-sm">QR Code will be displayed here</p>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-16 w-16" />
                  <p className="text-sm">QR Code will be displayed here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Number */}
        {config.mobileNumber.enabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number</label>
            <div className="flex gap-2">
              <Input
                value={config.mobileNumber.number}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopy(config.mobileNumber.number, 'Mobile Number')}
              >
                {copiedField === 'Mobile Number' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <a
              href={`tel:${config.mobileNumber.number.replace(/\s/g, '')}`}
              className="text-sm text-primary hover:underline"
            >
              Call to donate
            </a>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center pt-2">
          All donations are securely processed. Thank you for your support!
        </p>
      </CardContent>
    </Card>
  );
}
