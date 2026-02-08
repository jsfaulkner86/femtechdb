import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company, FemtechCategory } from '@/types/company';

interface UnclaimedCompanyRow {
  id: string;
}

/**
 * Hook to fetch companies that are available for claiming.
 * Uses the unclaimed_companies view to avoid exposing claimed_by field,
 * then fetches full company data from companies_public view.
 */
export function useUnclaimedCompanies(search: string) {
  return useQuery({
    queryKey: ['unclaimed-companies', search],
    queryFn: async () => {
      // First get IDs of unclaimed companies from the secure view
      const { data: unclaimedIds, error: unclaimedError } = await supabase
        .from('unclaimed_companies')
        .select('id');

      if (unclaimedError) throw unclaimedError;
      if (!unclaimedIds || unclaimedIds.length === 0) return [];

      const ids = (unclaimedIds as UnclaimedCompanyRow[]).map(c => c.id);

      // Now fetch full company data from companies_public view (excludes claimed_by)
      let query = supabase
        .from('companies_public')
        .select('*')
        .in('id', ids)
        .order('name');

      if (search && search.trim()) {
        const sanitizedSearch = search.trim().slice(0, 100).replace(/[%_]/g, '\\$&');
        query = query.or(`name.ilike.%${sanitizedSearch}%,mission.ilike.%${sanitizedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch categories for these companies
      const { data: allCategories } = await supabase
        .from('company_categories')
        .select('company_id, category')
        .in('company_id', data?.map(c => c.id) || []);

      // Map categories to companies
      return (data || []).map(company => ({
        ...company,
        categories: allCategories
          ?.filter(cc => cc.company_id === company.id)
          .map(cc => cc.category as FemtechCategory) || [company.category]
      })) as Company[];
    },
    enabled: search.length >= 2,
  });
}
