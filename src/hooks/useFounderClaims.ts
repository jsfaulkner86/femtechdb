import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company, FemtechCategory } from '@/types/company';

interface FounderClaim {
  id: string;
  company_id: string;
  user_id: string;
  user_email: string;
  status: 'pending' | 'approved' | 'rejected';
  domain_verified: boolean;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export function useFounderClaims(userId: string | undefined) {
  return useQuery({
    queryKey: ['founder-claims', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('founder_claims')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FounderClaim[];
    },
    enabled: !!userId,
  });
}

export function useClaimedCompany(userId: string | undefined) {
  return useQuery({
    queryKey: ['claimed-company', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('claimed_by', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch categories for this company
      const { data: categories } = await supabase
        .from('company_categories')
        .select('category')
        .eq('company_id', data.id);

      return {
        ...data,
        categories: categories?.map(c => c.category as FemtechCategory) || [data.category]
      } as Company;
    },
    enabled: !!userId,
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, userEmail }: { companyId: string; userEmail: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('founder_claims')
        .insert({
          company_id: companyId,
          user_id: user.id,
          user_email: userEmail,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FounderClaim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founder-claims'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-company'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      updates,
      categories
    }: { 
      companyId: string; 
      updates: Partial<Company>;
      categories?: FemtechCategory[];
    }) => {
      // Update company data (excluding categories array)
      const { categories: _, ...companyUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('companies')
        .update(companyUpdates)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;

      // Update categories if provided
      if (categories && categories.length > 0) {
        // Delete existing categories
        await supabase
          .from('company_categories')
          .delete()
          .eq('company_id', companyId);

        // Insert new categories
        const { error: categoryError } = await supabase
          .from('company_categories')
          .insert(categories.map(cat => ({
            company_id: companyId,
            category: cat
          })));

        if (categoryError) throw categoryError;
      }

      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-company'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
}

interface CreateCompanyData {
  name: string;
  website_url: string;
  logo_url: string | null;
  headquarters: string | null;
  founded_year: number | null;
  categories: FemtechCategory[];
  mission: string | null;
  problem: string | null;
  solution: string | null;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const primaryCategory = data.categories[0] || 'other';

      // Create the company with claimed_by set to the current user
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          website_url: data.website_url,
          logo_url: data.logo_url,
          headquarters: data.headquarters,
          founded_year: data.founded_year,
          category: primaryCategory,
          mission: data.mission,
          problem: data.problem,
          solution: data.solution,
          claimed_by: user.id,
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert categories into junction table
      if (data.categories.length > 0) {
        const { error: categoryError } = await supabase
          .from('company_categories')
          .insert(data.categories.map(cat => ({
            company_id: company.id,
            category: cat
          })));

        if (categoryError) {
          console.error('Failed to insert categories:', categoryError);
        }
      }

      return company as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-company'] });
    },
  });
}
