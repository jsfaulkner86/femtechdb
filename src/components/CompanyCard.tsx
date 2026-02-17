import { useState } from 'react';
import { ExternalLink, MapPin, Calendar, BadgeCheck, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Company, categoryLabels, categoryColors, commercializationPhaseLabels } from '@/types/company';
import { CompletenessIndicator } from './CompletenessIndicator';
import { SafeLink } from './SafeLink';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompanyCardProps {
  company: Company;
  onClick: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const [logoError, setLogoError] = useState(false);
  const { t } = useLanguage();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  };
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BadgeCheck className="h-5 w-5 text-sage flex-shrink-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                     <p className="font-medium">{t('Verified Company')}</p>
                     <p className="text-xs text-muted-foreground">
                       {t('This company has been independently verified by our team.')}
                     </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(company.categories || [company.category]).slice(0, 3).map((cat, idx) => (
                <Badge 
                  key={cat}
                  variant="secondary"
                  className={`${categoryColors[cat]} ${idx > 0 ? 'text-xs px-2 py-0.5' : ''}`}
                >
                  {categoryLabels[cat]}
                </Badge>
              ))}
              {(company.categories || []).length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{(company.categories || []).length - 3}
                </Badge>
              )}
              <CompletenessIndicator company={company} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-10 w-10 rounded-lg border border-border/50 bg-muted overflow-hidden flex items-center justify-center">
              {company.logo_url && !logoError ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  {getInitials(company.name)}
                </span>
              )}
            </div>
            {company.website_url && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <SafeLink href={company.website_url}>
                  <ExternalLink className="h-4 w-4" />
                </SafeLink>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {company.mission && <p className="text-sm text-muted-foreground line-clamp-2">{t(company.mission)}</p>}

        <div className="space-y-2">
          {company.problem && (
            <div className="text-sm">
              <span className="font-medium text-destructive/80">{t('Problem')}: </span>
              <span className="text-muted-foreground line-clamp-1">{t(company.problem)}</span>
            </div>
          )}
          
          {company.solution && (
            <div className="text-sm">
              <span className="font-medium text-sage">{t('Solution')}: </span>
              <span className="text-muted-foreground line-clamp-1">{t(company.solution)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
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
            {company.commercialization_phase && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{commercializationPhaseLabels[company.commercialization_phase]}</span>
              </div>
            )}
          </div>
          {company.updated_at && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-muted-foreground/60 cursor-help">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(company.updated_at), { addSuffix: true })}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Last updated: {new Date(company.updated_at).toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
