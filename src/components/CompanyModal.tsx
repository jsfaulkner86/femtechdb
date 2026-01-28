import { ExternalLink, MapPin, Calendar, BadgeCheck, Target, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Company, categoryLabels, categoryColors } from '@/types/company';

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyModal({ company, isOpen, onClose }: CompanyModalProps) {
  if (!company) return null;

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
                      <p className="font-medium">Verified Company</p>
                      <p className="text-xs text-muted-foreground">
                        This company has been independently verified by our team.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              <Badge className={categoryColors[company.category]}>
                {categoryLabels[company.category]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mission */}
          {company.mission && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Mission
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {company.mission}
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
                    Problem
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company.problem}
                </p>
              </div>
            )}

            {company.solution && (
              <div className="space-y-2 p-4 rounded-xl bg-sage/10 border border-sage/20">
                <div className="flex items-center gap-2 text-sage">
                  <Lightbulb className="h-4 w-4" />
                  <h4 className="text-sm font-semibold uppercase tracking-wide">
                    Solution
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company.solution}
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
                <span>Founded {company.founded_year}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {company.website_url && (
            <Button 
              className="w-full"
              asChild
            >
              <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
