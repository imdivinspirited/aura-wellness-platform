/**
 * Services Overview - Quick Links Section
 *
 * Emergency contacts and quick access links.
 */

import { Phone, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { ServicesPageData } from '../types';

interface QuickLinksSectionProps {
  data: ServicesPageData['quickLinks'];
}

export const QuickLinksSection = ({ data }: QuickLinksSectionProps) => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container max-w-7xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Emergency Contacts */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.emergency.map((contact) => (
                <div key={contact.id} className="p-3 bg-white rounded-lg">
                  <p className="font-semibold text-sm mb-1">{contact.service}</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                    {contact.extension && <span className="text-muted-foreground">ext. {contact.extension}</span>}
                  </a>
                  {contact.location && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {contact.location}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Help Desks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Help Desks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.helpDesks.map((desk) => (
                <div key={desk.id} className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold text-sm mb-1">{desk.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{desk.description}</p>
                  {desk.contact?.phone && (
                    <a
                      href={`tel:${desk.contact.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {desk.contact.phone}
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rules & Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rules & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.rules.map((rule) => (
                <Button
                  key={rule.id}
                  asChild
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Link to={rule.link}>
                    {rule.title}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
