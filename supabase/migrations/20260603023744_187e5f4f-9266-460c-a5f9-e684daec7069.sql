-- 1. Restrict founder_claims policies to authenticated role only
DROP POLICY IF EXISTS "Users can create claims" ON public.founder_claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON public.founder_claims;
DROP POLICY IF EXISTS "Admins can view all claims" ON public.founder_claims;
DROP POLICY IF EXISTS "Admins can update claims" ON public.founder_claims;
DROP POLICY IF EXISTS "Admins can delete claims" ON public.founder_claims;

CREATE POLICY "Users can create claims"
ON public.founder_claims
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own claims"
ON public.founder_claims
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all claims"
ON public.founder_claims
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update claims"
ON public.founder_claims
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete claims"
ON public.founder_claims
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure anon role cannot reach the table at all
REVOKE ALL ON public.founder_claims FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_claims TO authenticated;

-- 2. Remove ineffective permissive deny on function_executions (admin-only policy remains)
DROP POLICY IF EXISTS "Deny public access to execution logs" ON public.function_executions;

DROP POLICY IF EXISTS "Admins can view execution logs" ON public.function_executions;
CREATE POLICY "Admins can view execution logs"
ON public.function_executions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

REVOKE ALL ON public.function_executions FROM anon;

-- 3. Restrict has_role execute to authenticated only (needed for RLS); block anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;