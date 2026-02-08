-- Allow authenticated users to create their own company profiles
-- They can only insert if they set themselves as the claimed_by owner
CREATE POLICY "Founders can create their own company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (claimed_by = auth.uid());

-- Allow founders to insert categories for companies they own
-- (This might already be covered by the ALL policy, but being explicit for INSERT)
CREATE POLICY "Founders can insert categories for their company"
ON public.company_categories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_categories.company_id
    AND companies.claimed_by = auth.uid()
  )
);