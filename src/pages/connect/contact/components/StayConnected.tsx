import { motion } from 'framer-motion';
import { Phone, Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ContactMethod } from '../data';

interface StayConnectedProps {
  contactMethods: ContactMethod[];
}

export const StayConnectedSection = ({ contactMethods }: StayConnectedProps) => {
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedItems((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAction = (method: ContactMethod) => {
    if (method.action === 'call') {
      window.location.href = `tel:${method.value}`;
    } else if (method.action === 'email') {
      window.location.href = `mailto:${method.value}`;
    } else if (method.action === 'copy') {
      handleCopy(method.value, method.value);
    }
  };

  return (
    <section className="py-12" aria-labelledby="stay-connected-heading">
      <Card className="border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle id="stay-connected-heading" className="text-2xl font-light">
            Stay Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {method.type === 'phone' ? (
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{method.label}</p>
                    <a
                      href={method.type === 'phone' ? `tel:${method.value}` : `mailto:${method.value}`}
                      className="text-base font-medium text-stone-900 hover:text-primary transition-colors break-all"
                      aria-label={`${method.label}: ${method.value}`}
                    >
                      {method.value}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {method.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(method)}
                      className="h-8"
                      aria-label={`${method.action} ${method.label}`}
                    >
                      {method.action === 'call' && 'Call'}
                      {method.action === 'email' && 'Email'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(method.value, method.value)}
                    className="h-8 w-8 p-0"
                    aria-label={`Copy ${method.label}`}
                  >
                    {copiedItems[method.value] ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
