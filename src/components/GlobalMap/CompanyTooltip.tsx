import { ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CompanyLocation } from '@/hooks/useCompanyLocations';

interface CompanyTooltipProps {
  company: CompanyLocation;
  position: { x: number; y: number };
  categoryLabel: string;
}

export function CompanyTooltip({ company, position, categoryLabel }: CompanyTooltipProps) {
  // Calculate tooltip position to keep it in viewport
  const tooltipX = Math.min(position.x + 16, window.innerWidth - 320);
  const tooltipY = Math.min(position.y - 8, window.innerHeight - 200);

  return (
    <div
      className="fixed z-50 pointer-events-none animate-fade-in"
      style={{
        left: tooltipX,
        top: tooltipY,
      }}
    >
      <div className="bg-card border border-border rounded-xl shadow-xl p-4 w-72 backdrop-blur-lg">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground leading-tight">{company.name}</h3>
          {company.website_url && (
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <Badge variant="secondary" className="mt-2 text-xs">
          {categoryLabel}
        </Badge>

        {company.mission && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {company.mission}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {[company.state, company.country].filter(Boolean).join(', ')}
          </span>
        </div>

        <p className="mt-2 text-xs text-primary">Click marker for details</p>
      </div>
    </div>
  );
}
