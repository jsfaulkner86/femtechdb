import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company, FemtechCategory } from '@/types/company';

interface UseCompaniesOptions {
  search?: string;
  category?: FemtechCategory | 'all';
  continent?: string | null;
  country?: string | null;
  state?: string | null;
  letter?: string | null;
}

const PAGE_SIZE = 50;

export function useCompanies({
  search,
  category,
  continent,
  country,
  state,
  letter,
}: UseCompaniesOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['companies', search, category, continent, country, state, letter],
    initialPageParam: 0,
    getNextPageParam: (lastPage: Company[], allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    queryFn: async ({ pageParam = 0 }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Resolve company-id pre-filter when filtering by category
      let restrictIds: string[] | null = null;
      if (category && category !== 'all') {
        const { data: catData, error: catErr } = await supabase
          .from('company_categories')
          .select('company_id')
          .eq('category', category);
        if (catErr) throw catErr;
        restrictIds = (catData ?? []).map(c => c.company_id);
        if (restrictIds.length === 0) return [];
      }

      let query = supabase
        .from('companies_public')
        .select('*')
        .order('name')
        .range(from, to);

      if (restrictIds) query = query.in('id', restrictIds);

      if (search && search.trim()) {
        const sanitized = search.trim().slice(0, 100).replace(/[%_]/g, '\\$&');
        query = query.or(
          `name.ilike.%${sanitized}%,mission.ilike.%${sanitized}%,problem.ilike.%${sanitized}%,solution.ilike.%${sanitized}%`
        );
      }

      if (letter) {
        if (letter === '#') {
          // Names not starting with a letter (numbers/symbols)
          query = query.not('name', 'ilike', 'a%')
            .not('name', 'ilike', 'b%').not('name', 'ilike', 'c%')
            .not('name', 'ilike', 'd%').not('name', 'ilike', 'e%')
            .not('name', 'ilike', 'f%').not('name', 'ilike', 'g%')
            .not('name', 'ilike', 'h%').not('name', 'ilike', 'i%')
            .not('name', 'ilike', 'j%').not('name', 'ilike', 'k%')
            .not('name', 'ilike', 'l%').not('name', 'ilike', 'm%')
            .not('name', 'ilike', 'n%').not('name', 'ilike', 'o%')
            .not('name', 'ilike', 'p%').not('name', 'ilike', 'q%')
            .not('name', 'ilike', 'r%').not('name', 'ilike', 's%')
            .not('name', 'ilike', 't%').not('name', 'ilike', 'u%')
            .not('name', 'ilike', 'v%').not('name', 'ilike', 'w%')
            .not('name', 'ilike', 'x%').not('name', 'ilike', 'y%')
            .not('name', 'ilike', 'z%');
        } else {
          query = query.ilike('name', `${letter}%`);
        }
      }

      if (continent) query = query.eq('continent', continent);
      if (country) query = query.eq('country', country);
      if (state) query = query.eq('state', state);

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch categories ONLY for this page (typically 50 IDs)
      const ids = data.map(c => c.id);
      const { data: cats } = await supabase
        .from('company_categories')
        .select('company_id, category')
        .in('company_id', ids);

      const catMap = new Map<string, FemtechCategory[]>();
      (cats ?? []).forEach(cc => {
        const arr = catMap.get(cc.company_id) ?? [];
        arr.push(cc.category as FemtechCategory);
        catMap.set(cc.company_id, arr);
      });

      return data.map(company => ({
        ...company,
        categories: catMap.get(company.id) ?? [company.category],
      })) as Company[];
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const { data: categories } = await supabase
        .from('company_categories')
        .select('category')
        .eq('company_id', id);

      return {
        ...data,
        categories: categories?.map(c => c.category as FemtechCategory) || [data.category],
      } as Company;
    },
    enabled: !!id,
  });
}

export function useCompanyCount() {
  return useQuery({
    queryKey: ['companies-count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_conference_company_count');
      if (error) throw error;
      return data as number;
    },
    staleTime: 1000 * 60 * 5,
  });
}
