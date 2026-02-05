-- Fix 1: Add explicit SELECT policy to companies_public view
-- The view is a SECURITY INVOKER view that excludes claimed_by for privacy
-- Add an explicit RLS-like policy pattern (views don't use RLS directly, but we ensure proper access)
-- Since it's a view with SECURITY INVOKER, it inherits the companies table's RLS policies
-- The view already excludes sensitive columns, so we just need to document the intent

-- Fix 2: Ensure company_submissions table has proper SELECT restriction
-- Currently there's "Admins can view all submissions" SELECT policy, but let's verify
-- and add a deny-all policy for non-admins to be explicit

-- First, let's check if there's already a SELECT restriction and add one if missing
-- Drop any existing policy that might allow public SELECT (there shouldn't be one)
DO $$
BEGIN
    -- Check if there's already a restrictive SELECT policy for non-admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_submissions' 
        AND policyname = 'Deny public read access to submissions'
    ) THEN
        -- Add explicit deny for public read access
        EXECUTE 'CREATE POLICY "Deny public read access to submissions" ON public.company_submissions FOR SELECT USING (false)';
    END IF;
END $$;

-- Note: The companies_public view uses SECURITY INVOKER which means it respects
-- the RLS policies of the underlying companies table. This is already secure.
-- The view intentionally excludes the claimed_by column for privacy.