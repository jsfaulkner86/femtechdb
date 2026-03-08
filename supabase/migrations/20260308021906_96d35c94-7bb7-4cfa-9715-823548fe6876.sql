
CREATE OR REPLACE FUNCTION public.get_non_conference_company_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT cc.company_id)
  FROM public.company_categories cc
  WHERE cc.category != 'conferences'
  AND cc.company_id NOT IN (
    SELECT sub.company_id
    FROM public.company_categories sub
    GROUP BY sub.company_id
    HAVING COUNT(*) = 1 AND MAX(sub.category::text) = 'conferences'
  );
$$;
