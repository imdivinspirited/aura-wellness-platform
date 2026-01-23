/**
 * Facilities - Emergency Contacts
 *
 * Prominent emergency contact information.
 */

import { Phone, AlertTriangle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EmergencyContact } from '../../types';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

export const EmergencyContacts = ({ contacts }: EmergencyContactsProps) => {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Emergency Contacts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          For immediate assistance, contact these services
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 bg-white rounded-lg border border-red-100">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{contact.service}</h3>
                {contact.available === '24/7' && (
                  <Badge variant="destructive" className="text-xs">24/7</Badge>
                )}
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-2 text-primary hover:underline font-medium mb-2"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
                {contact.extension && (
                  <span className="text-muted-foreground text-sm">ext. {contact.extension}</span>
                )}
              </a>
              {contact.location && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {contact.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
