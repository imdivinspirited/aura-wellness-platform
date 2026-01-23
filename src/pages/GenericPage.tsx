import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { NavItem } from '@/config/navigation';
import { findNavItemByPath, getParentChain, navigationItems } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { ArrowRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface GenericPageProps {
  path: string;
  title?: string;
}

// Extended NavItem type with optional description
interface NavItemWithDescription extends NavItem {
  description?: string;
}

export const GenericPage = ({ path: pathProp, title }: GenericPageProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const path = pathProp || location.pathname;
  const navItem = findNavItemByPath(navigationItems, path);

  // Get breadcrumb chain
  const breadcrumbChain = navItem ? getParentChain(navigationItems, navItem.id) : null;

  const displayTitle = title || navItem?.label || t('common.notFound');
  const hasChildren = navItem?.children && navItem.children.length > 0;

  return (
    <MainLayout>
      <div className="container py-8 max-w-6xl">
        {/* Breadcrumbs */}
        {breadcrumbChain && breadcrumbChain.length > 0 && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbChain.map((item, index) => {
                const isLast = index === breadcrumbChain.length - 1;
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.href || '#'}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">{displayTitle}</h1>
          {navItem && (
            <p className="text-muted-foreground text-lg">
              {t('empty.noResults')} {/* Placeholder for description */}
            </p>
          )}
        </div>

        {/* Empty State or Content */}
        {!navItem ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">{t('common.notFound')}</p>
                <p className="text-sm text-muted-foreground">{t('empty.tryAgain')}</p>
              </div>
            </CardContent>
          </Card>
        ) : hasChildren ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {navItem.children?.map(child => {
              const IconComponent = child.icon;
              const childWithDescription = child as NavItemWithDescription;

              return (
                <Card
                  key={child.id}
                  className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-stone-200"
                >
                  {/* Image/Icon Header */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 overflow-hidden">
                    {IconComponent ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <IconComponent className="h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <div className="h-16 w-16 rounded-full bg-primary/20" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                        {child.label}
                      </CardTitle>
                      {child.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {childWithDescription.description || t('empty.noData')}
                    </p>
                    {child.href && (
                      <Button asChild variant="outline" className="w-full group/btn">
                        <Link to={child.href}>
                          {t('common.continue')}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">{t('empty.noData')}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

// Individual page components for main nav items
import { EventsListingPage } from './events/EventsListingPage';
import { ProgramsListingPage } from './programs/ProgramsListingPage';
export const ProgramsPage = () => <ProgramsListingPage />;
export const ServicesPage = () => <GenericPage path="/services" title="Services" />;
export const EventsPage = () => <EventsListingPage />;
export const ExplorePage = () => <GenericPage path="/explore" title="Explore" />;
export const OpportunitiesPage = () => <GenericPage path="/opportunities" title="Opportunities" />;
export const ConnectPage = () => <GenericPage path="/connect" title="Connect" />;
