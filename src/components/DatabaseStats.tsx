import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, RefreshCw, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCompanyCount } from '@/hooks/useCompanies';

export function DatabaseStats() {
  const { data: companyCount } = useCompanyCount();
  
  const { data: stats } = useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      // Get latest update time
      const { data: latestCompany } = await supabase
        .from('companies')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get verified count
      const { count: verifiedCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      return {
        lastUpdated: latestCompany?.updated_at,
        verifiedCount: verifiedCount ?? 0,
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  if (!stats || companyCount === undefined) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 bg-muted/30 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 text-sm">
        <Database className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{companyCount}</span> companies
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2 text-sm">
        <Shield className="h-4 w-4 text-sage" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{stats.verifiedCount}</span> verified
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2 text-sm">
        <RefreshCw className="h-4 w-4 text-accent" />
        <span className="text-muted-foreground">
          Updated{' '}
          <span className="font-medium text-foreground">
            {stats.lastUpdated 
              ? formatDistanceToNow(new Date(stats.lastUpdated), { addSuffix: true })
              : 'recently'}
          </span>
        </span>
      </div>
    </div>
  );
}
