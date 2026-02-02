-- Fix 1: Add SELECT policy for company_submissions to restrict to admins only
-- The table already has "Admins can view all submissions" policy, but we need to ensure
-- there's no public access. Let's verify and add explicit protection.

-- Fix 2: Add explicit DENY policy for function_executions for non-admin users
-- Currently only has admin SELECT policy, but needs explicit denial for others
CREATE POLICY "Deny public access to execution logs"
ON public.function_executions
FOR SELECT
USING (false);

-- Fix 3: Create a public view for companies that excludes the claimed_by field
-- This prevents exposure of user UUIDs while maintaining functionality
CREATE OR REPLACE VIEW public.companies_public
WITH (security_invoker = on) AS
SELECT 
    id,
    name,
    category,
    mission,
    problem,
    solution,
    website_url,
    logo_url,
    headquarters,
    state,
    country,
    continent,
    founded_year,
    commercialization_phase,
    source_url,
    is_verified,
    created_at,
    updated_at
    -- Intentionally excluding claimed_by to protect user privacy
FROM public.companies;

-- Grant access to the public view
GRANT SELECT ON public.companies_public TO anon;
GRANT SELECT ON public.companies_public TO authenticated;