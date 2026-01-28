-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Service role can update companies" ON public.companies;

-- Note: The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely,
-- so we don't need explicit policies for the automated updates.
-- This keeps the table secure - only readable by public, writable only via service role.
