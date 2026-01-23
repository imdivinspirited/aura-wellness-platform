/**
 * Services Overview - Service Card
 *
 * Reusable service card component.
 */

import { motion } from 'framer-motion';
import { ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import type { ServiceOverview } from '../types';
import * as Icons from 'lucide-react';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface ServiceCardProps {
  service: ServiceOverview;
}

const statusConfig = {
  open: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Open' },
  closed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Closed' },
  limited: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Limited' },
  maintenance: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Maintenance' },
};

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const IconComponent = Icons[service.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
  const StatusIcon = statusConfig[service.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-stone-200">
        {/* Image/Icon Header */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
          <div className="h-full w-full flex items-center justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="h-12 w-12 text-primary" />
            </div>
          </div>
          <Badge
            variant="outline"
            className={`absolute top-3 right-3 ${statusConfig[service.status].bg} ${statusConfig[service.status].color} border-current`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[service.status].label}
          </Badge>
        </div>

        <CardHeader>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {service.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">
            {service.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{service.timings}</span>
            </div>
            {service.quickInfo && (
              <p className="text-xs text-muted-foreground italic">{service.quickInfo}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to={service.link}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <AddToCartButton
              itemId={`service-${service.id}`}
              itemType="service"
              title={service.name}
              subtitle={service.description}
              metadata={{
                type: service.type,
                timings: service.timings,
                status: service.status,
              }}
              variant="icon"
              size="default"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
