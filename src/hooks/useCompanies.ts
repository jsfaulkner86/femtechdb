import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company, FemtechCategory } from '@/types/company';

interface UseCompaniesOptions {
  search?: string;
  category?: FemtechCategory | 'all';
  continent?: string | null;
  country?: string | null;
  state?: string | null;
}

export function useCompanies({ search, category, continent, country, state }: UseCompaniesOptions = {}) {
  return useQuery({
    queryKey: ['companies', search, category, continent, country, state],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name');

      if (search && search.trim()) {
        // Sanitize search input: trim, limit length, and escape ILIKE pattern characters
        const sanitizedSearch = search.trim().slice(0, 100).replace(/[%_]/g, '\\$&');
        query = query.or(`name.ilike.%${sanitizedSearch}%,mission.ilike.%${sanitizedSearch}%,problem.ilike.%${sanitizedSearch}%,solution.ilike.%${sanitizedSearch}%`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (continent) {
        query = query.eq('continent', continent);
      }

      if (country) {
        query = query.eq('country', country);
      }

      if (state) {
        query = query.eq('state', state);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Company[];
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as Company | null;
    },
    enabled: !!id,
  });
}

export function useCompanyCount() {
  return useQuery({
    queryKey: ['companies-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .neq('category', 'conferences');

      if (error) {
        throw error;
      }

      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
