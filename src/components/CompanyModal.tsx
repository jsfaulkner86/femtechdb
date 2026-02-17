import { ExternalLink, MapPin, Calendar, BadgeCheck, Target, Lightbulb, Clock, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Company, categoryLabels, categoryColors } from '@/types/company';
import { SafeLink } from './SafeLink';
import { isValidHttpUrl } from '@/lib/url';
import { formatDistanceToNow, format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyModal({ company, isOpen, onClose }: CompanyModalProps) {
  if (!company) return null;
  const { t } = useLanguage();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="font-display text-2xl">
                  {company.name}
                </DialogTitle>
                {company.is_verified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BadgeCheck className="h-5 w-5 text-sage cursor-help" />
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
              
              <div className="flex flex-wrap gap-2">
                {(company.categories || [company.category]).map((cat) => (
                  <Badge key={cat} className={categoryColors[cat]}>
                    {categoryLabels[cat]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mission */}
          {company.mission && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {t('Mission')}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {t(company.mission)}
              </p>
            </div>
          )}

          <Separator />

          {/* Problem & Solution */}
          <div className="grid gap-6 md:grid-cols-2">
            {company.problem && (
              <div className="space-y-2 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="flex items-center gap-2 text-destructive/80">
                  <Target className="h-4 w-4" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">
                    {t('Problem')}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(company.problem)}
                </p>
              </div>
            )}

            {company.solution && (
              <div className="space-y-2 p-4 rounded-xl bg-sage/10 border border-sage/20">
                <div className="flex items-center gap-2 text-sage">
                  <Lightbulb className="h-4 w-4" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">
                    {t('Solution')}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(company.solution)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Details */}
          <div className="flex flex-wrap gap-6 text-sm">
            {company.headquarters && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{company.headquarters}</span>
              </div>
            )}
            {company.founded_year && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{t('Founded')} {company.founded_year}</span>
              </div>
            )}
          </div>

          {/* Last Updated */}
          {company.updated_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 bg-muted/50 rounded-lg px-3 py-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {t('Last updated')} {formatDistanceToNow(new Date(company.updated_at), { addSuffix: true })}
                <span className="mx-1">•</span>
                {format(new Date(company.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Source Citation */}
          {company.source_url && isValidHttpUrl(company.source_url) && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Link2 className="h-3.5 w-3.5" />
                <span className="font-medium">{t('Source')}</span>
              </div>
              <SafeLink 
                href={company.source_url}
                className="text-sm text-primary hover:underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {new URL(company.source_url).hostname.replace('www.', '')}
              </SafeLink>
            </div>
          )}

          {/* CTA */}
          {company.website_url && isValidHttpUrl(company.website_url) && (
            <Button 
              className="w-full"
              asChild
            >
              <SafeLink href={company.website_url}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('Visit Website')}
              </SafeLink>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
