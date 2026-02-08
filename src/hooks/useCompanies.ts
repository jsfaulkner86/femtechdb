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
      // If filtering by category, we need to find companies that have that category in the junction table
      if (category && category !== 'all') {
        // Get company IDs that have this category
        const { data: categoryData, error: categoryError } = await supabase
          .from('company_categories')
          .select('company_id')
          .eq('category', category);

        if (categoryError) throw categoryError;

        const companyIds = categoryData?.map(c => c.company_id) || [];
        
        if (companyIds.length === 0) {
          return [];
        }

        // Build main query with company ID filter - use companies_public view to avoid exposing claimed_by
        let query = supabase
          .from('companies_public')
          .select('*')
          .in('id', companyIds)
          .order('name');

        if (search && search.trim()) {
          const sanitizedSearch = search.trim().slice(0, 100).replace(/[%_]/g, '\\$&');
          query = query.or(`name.ilike.%${sanitizedSearch}%,mission.ilike.%${sanitizedSearch}%,problem.ilike.%${sanitizedSearch}%,solution.ilike.%${sanitizedSearch}%`);
        }

        if (continent) query = query.eq('continent', continent);
        if (country) query = query.eq('country', country);
        if (state) query = query.eq('state', state);

        const { data, error } = await query;
        if (error) throw error;

        // Fetch all categories for these companies
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
      }

      // No category filter - fetch all companies - use companies_public view to avoid exposing claimed_by
      let query = supabase
        .from('companies_public')
        .select('*')
        .order('name');

      if (search && search.trim()) {
        const sanitizedSearch = search.trim().slice(0, 100).replace(/[%_]/g, '\\$&');
        query = query.or(`name.ilike.%${sanitizedSearch}%,mission.ilike.%${sanitizedSearch}%,problem.ilike.%${sanitizedSearch}%,solution.ilike.%${sanitizedSearch}%`);
      }

      if (continent) query = query.eq('continent', continent);
      if (country) query = query.eq('country', country);
      if (state) query = query.eq('state', state);

      const { data, error } = await query;
      if (error) throw error;

      // Fetch all categories for these companies
      const { data: allCategories } = await supabase
        .from('company_categories')
        .select('company_id, category');

      // Map categories to companies
      return (data || []).map(company => ({
        ...company,
        categories: allCategories
          ?.filter(cc => cc.company_id === company.id)
          .map(cc => cc.category as FemtechCategory) || [company.category]
      })) as Company[];
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      // Use companies_public view to avoid exposing claimed_by
      const { data, error } = await supabase
        .from('companies_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) return null;

      // Fetch categories for this company
      const { data: categories } = await supabase
        .from('company_categories')
        .select('category')
        .eq('company_id', id);

      return {
        ...data,
        categories: categories?.map(c => c.category as FemtechCategory) || [data.category]
      } as Company;
    },
    enabled: !!id,
  });
}

export function useCompanyCount() {
  return useQuery({
    queryKey: ['companies-count'],
    queryFn: async () => {
      // Count companies that don't have 'conferences' as their ONLY category
      // First get all companies - use companies_public view
      const { data: allCompanies, error: companyError } = await supabase
        .from('companies_public')
        .select('id');

      if (companyError) throw companyError;

      // Get companies that have at least one non-conference category
      const { data: nonConferenceCategories, error: categoryError } = await supabase
        .from('company_categories')
        .select('company_id')
        .neq('category', 'conferences');

      if (categoryError) throw categoryError;

      // Get unique company IDs that have non-conference categories
      const nonConferenceCompanyIds = new Set(nonConferenceCategories?.map(c => c.company_id) || []);

      return nonConferenceCompanyIds.size;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
