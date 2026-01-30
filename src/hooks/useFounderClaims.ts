import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Company } from '@/types/company';

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
      return data as Company | null;
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
      updates 
    }: { 
      companyId: string; 
      updates: Partial<Company>;
    }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-company'] });
    },
  });
}
