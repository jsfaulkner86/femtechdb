import { useEffect, useRef } from 'react';
import { Company } from '@/types/company';
import { CompanyCard } from './CompanyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompanyGridProps {
  companies: Company[] | undefined;
  isLoading: boolean;
  onCompanyClick: (company: Company) => void;
  activeLetter?: string | null;
  totalCount?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export function CompanyGrid({
  companies,
  isLoading,
  onCompanyClick,
  activeLetter,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: CompanyGridProps) {
  const { t } = useLanguage();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: trigger fetchNextPage when sentinel becomes visible.
  useEffect(() => {
    if (!sentinelRef.current || !fetchNextPage || !hasNextPage) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('Showing')} <span className="font-medium text-foreground">{companies.length}</span>
          {activeLetter ? ` (${activeLetter})` : ''}
          {typeof totalCount === 'number' && !activeLetter ? ` ${t('of')} ${totalCount}` : ''} {t('companies')}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company, index) => (
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

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center items-center py-8">
          {isFetchingNextPage && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}
