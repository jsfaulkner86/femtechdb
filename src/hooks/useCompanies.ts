import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company, FemtechCategory } from '@/types/company';

interface UseCompaniesOptions {
  search?: string;
  category?: FemtechCategory | 'all';
}

export function useCompanies({ search, category }: UseCompaniesOptions = {}) {
  return useQuery({
    queryKey: ['companies', search, category],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name');

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,mission.ilike.%${search}%,problem.ilike.%${search}%,solution.ilike.%${search}%`);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
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
