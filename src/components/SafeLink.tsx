import { ReactNode } from 'react';
import { isValidHttpUrl } from '@/lib/url';

interface SafeLinkProps {
  href: string | null | undefined;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * A link component that only renders as an anchor tag if the URL is safe (http/https).
 * Prevents XSS attacks via javascript: or data: URLs.
 */
export function SafeLink({ href, children, className, onClick }: SafeLinkProps) {
  if (!isValidHttpUrl(href)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a 
      href={href!} 
      target="_blank" 
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
