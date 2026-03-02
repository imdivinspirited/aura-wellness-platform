import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type SmartLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'> & {
  to: string;
  /**
   * Explicitly allow opening in a new tab. Defaults to false globally.
   */
  openInNewTab?: boolean;
  /**
   * Force rendering as an <a> even if the URL looks internal.
   */
  forceAnchor?: boolean;
};

function isExternalUrl(to: string): boolean {
  return /^https?:\/\//i.test(to) || /^mailto:/i.test(to) || /^tel:/i.test(to);
}

/**
 * SmartLink
 *
 * - Internal URLs: React Router <Link>
 * - External URLs: <a>
 * - target="_blank" is NEVER the default; only when openInNewTab === true
 */
export function SmartLink({
  to,
  openInNewTab = false,
  forceAnchor = false,
  rel,
  children,
  ...rest
}: SmartLinkProps) {
  const external = isExternalUrl(to);

  if (!external && !forceAnchor) {
    // React Router doesn't accept all anchor props; cast only those we need.
    const linkProps = rest as unknown as Omit<LinkProps, 'to'>;
    return (
      <Link to={to} {...linkProps}>
        {children}
      </Link>
    );
  }

  const target = openInNewTab ? '_blank' : undefined;
  const safeRel = openInNewTab ? (rel ? `${rel} noopener noreferrer` : 'noopener noreferrer') : rel;

  return (
    <a href={to} target={target} rel={safeRel} {...rest}>
      {children}
    </a>
  );
}

