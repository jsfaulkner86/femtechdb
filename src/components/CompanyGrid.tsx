import { useMemo, useEffect, useState } from 'react';
import { Company } from '@/types/company';
import { CompanyCard } from './CompanyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompanyGridProps {
  companies: Company[] | undefined;
  isLoading: boolean;
  onCompanyClick: (company: Company) => void;
  activeLetter?: string | null;
}

function getLetterKey(name: string): string {
  const first = name[0]?.toUpperCase() ?? '#';
  return /[A-Z]/.test(first) ? first : '#';
}

export function CompanyGrid({ companies, isLoading, onCompanyClick, activeLetter }: CompanyGridProps) {
  const { t } = useLanguage();

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    if (!activeLetter) return companies;
    return companies.filter(c => getLetterKey(c.name) === activeLetter);
  }, [companies, activeLetter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('No companies found')}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('Try adjusting your search or filter to find what you\'re looking for.')}
          </p>
        </div>
      </div>
    );
  }

  if (filteredCompanies.length === 0 && activeLetter) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('No companies found')} for "{activeLetter}"
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('Showing')} <span className="font-medium text-foreground">{filteredCompanies.length}</span>
          {activeLetter ? ` (${activeLetter})` : ''} {t('of')} {companies.length} {t('companies')}
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCompanies.map((company, index) => (
          <div 
            key={company.id} 
            style={{ animationDelay: `${Math.min(index, 20) * 0.03}s` }}
          >
            <CompanyCard 
              company={company} 
              onClick={() => onCompanyClick(company)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
