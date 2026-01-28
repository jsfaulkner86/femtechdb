import { ExternalLink, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Company, categoryLabels, categoryColors } from '@/types/company';

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  return (
    <Card 
      className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              {company.is_verified && (
                <CheckCircle2 className="h-4 w-4 text-sage flex-shrink-0" />
              )}
            </div>
            
            <Badge 
              variant="secondary"
              className={`mt-2 ${categoryColors[company.category]}`}
            >
              {categoryLabels[company.category]}
            </Badge>
          </div>
          
          {company.website_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {company.mission && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {company.mission}
          </p>
        )}

        <div className="space-y-2">
          {company.problem && (
            <div className="text-sm">
              <span className="font-medium text-destructive/80">Problem: </span>
              <span className="text-muted-foreground line-clamp-1">{company.problem}</span>
            </div>
          )}
          
          {company.solution && (
            <div className="text-sm">
              <span className="font-medium text-sage">Solution: </span>
              <span className="text-muted-foreground line-clamp-1">{company.solution}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          {company.headquarters && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{company.headquarters}</span>
            </div>
          )}
          {company.founded_year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{company.founded_year}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
