/**
 * Standard Card Component
 * 
 * A reusable card component that follows the global card image system.
 * Supports all card types with consistent image handling and link behavior.
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { getCardImage, type CardImageConfig } from '@/lib/images/cardImages';
import { Link } from 'react-router-dom';

interface StandardCardProps extends CardImageConfig {
  className?: string;
  showButton?: boolean;
  buttonText?: string;
  onCardClick?: () => void;
}

export function StandardCard({
  title,
  description,
  image,
  link,
  openInNewTab = false,
  category,
  className,
  showButton = true,
  buttonText,
  onCardClick,
}: StandardCardProps) {
  const imagePath = getCardImage({ title, image, category });
  const displayButtonText = buttonText || (link ? 'Learn More' : 'View Details');

  const cardContent = (
    <Card className={`h-full overflow-hidden hover:shadow-lg transition-shadow ${className || ''}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
        <img
          src={imagePath}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback to default if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== imagePath) {
              target.src = `/images/${category}/default.jpg`;
            }
          }}
        />
      </div>

      {/* Content */}
      <CardHeader>
        <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-3 mt-2">{description}</CardDescription>
        )}
      </CardHeader>

      {showButton && (
        <CardFooter>
          {link ? (
            openInNewTab ? (
              <Button asChild variant="outline" className="w-full">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {displayButtonText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : link.startsWith('http') ? (
              <Button asChild variant="outline" className="w-full">
                <a href={link}>
                  {displayButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link to={link}>
                  {displayButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )
          ) : (
            <Button variant="outline" className="w-full" onClick={onCardClick}>
              {displayButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  // If link is provided and not external, wrap in Link
  if (link && !openInNewTab && !link.startsWith('http') && !onCardClick) {
    return (
      <Link to={link} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
