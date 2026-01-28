import { Company } from '@/types/company';
import { CompanyCard } from './CompanyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

interface CompanyGridProps {
  companies: Company[] | undefined;
  isLoading: boolean;
  onCompanyClick: (company: Company) => void;
}

export function CompanyGrid({ companies, isLoading, onCompanyClick }: CompanyGridProps) {
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
          <h3 className="text-lg font-semibold text-foreground mb-2">No companies found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{companies.length}</span> companies
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company, index) => (
          <div 
            key={company.id} 
            style={{ animationDelay: `${index * 0.05}s` }}
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
