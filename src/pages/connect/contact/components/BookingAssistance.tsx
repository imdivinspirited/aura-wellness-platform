import { motion } from 'framer-motion';
import { Phone, Mail, Clock, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BookingAssistance } from '../data';

interface BookingAssistanceProps {
  data: BookingAssistance;
}

export const BookingAssistanceSection = ({ data }: BookingAssistanceProps) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopy = async (text: string, type: 'phone' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'phone') {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <section className="py-12" aria-labelledby="booking-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle id="booking-heading" className="text-2xl font-light">
            {data.title}
          </CardTitle>
          <p className="text-muted-foreground mt-2">{data.description}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-stone-700">
                <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium">Phone</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:${data.contactInfo.phone}`}
                  className="text-lg font-medium text-stone-900 hover:text-primary transition-colors"
                  aria-label={`Call ${data.contactInfo.phone}`}
                >
                  {data.contactInfo.phone}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCall(data.contactInfo.phone)}
                  className="h-8"
                  aria-label="Call booking assistance"
                >
                  Call
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.contactInfo.phone, 'phone')}
                  className="h-8"
                  aria-label="Copy phone number"
                >
                  {copiedPhone ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-stone-700">
                <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium">Email</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`mailto:${data.contactInfo.email}`}
                  className="text-lg font-medium text-stone-900 hover:text-primary transition-colors break-all"
                  aria-label={`Email ${data.contactInfo.email}`}
                >
                  {data.contactInfo.email}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmail(data.contactInfo.email)}
                  className="h-8"
                  aria-label="Send email"
                >
                  Email
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(data.contactInfo.email, 'email')}
                  className="h-8"
                  aria-label="Copy email address"
                >
                  {copiedEmail ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 flex items-center gap-2 text-stone-700"
            >
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>{data.contactInfo.hours}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
