-- Create a security invoker view to get unclaimed company IDs
-- This allows checking if a company is claimable without exposing claimed_by
CREATE OR REPLACE VIEW public.unclaimed_companies 
WITH (security_invoker=on) AS
SELECT id
FROM public.companies
WHERE claimed_by IS NULL;