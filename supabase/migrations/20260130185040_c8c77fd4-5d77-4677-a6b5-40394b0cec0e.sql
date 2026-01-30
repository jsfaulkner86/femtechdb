-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert execution logs" ON public.function_executions;

-- Service role bypasses RLS anyway, so we don't need a specific policy for it
-- The table will only be writable by service role (which is what we want)