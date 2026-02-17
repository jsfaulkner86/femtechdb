import { Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { categoryLabels, categoryColors, type Company } from '@/types/company';
import { CompletenessIndicator } from './CompletenessIndicator';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeaturedCompaniesProps {
  onCompanyClick: (company: Company) => void;
}

export function FeaturedCompanies({ onCompanyClick }: FeaturedCompaniesProps) {
  const { t } = useLanguage();
  const { data: featuredCompanies, isLoading } = useQuery({
    queryKey: ['featured-companies'],
    queryFn: async () => {
      // Get verified companies with most complete profiles, recently updated
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_verified', true)
        .not('mission', 'is', null)
        .not('problem', 'is', null)
        .not('solution', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Company[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">{t('Featured Companies')}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredCompanies?.length) return null;

  return (
    <section className="py-12 bg-gradient-subtle border-y border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{t('Featured Companies')}</h2>
              <p className="text-sm text-muted-foreground">{t('Verified & recently updated')}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredCompanies.map((company) => (
            <Card
              key={company.id}
              className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              onClick={() => onCompanyClick(company)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {company.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`mt-1 text-xs ${categoryColors[company.category]}`}
                    >
                      {categoryLabels[company.category]}
                    </Badge>
                  </div>
                  <CompletenessIndicator company={company} />
                </div>

                {company.mission && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {t(company.mission)}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {company.headquarters || company.country || 'Global'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
