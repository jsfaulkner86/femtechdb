
-- Backfill: insert missing company_categories from companies.category
INSERT INTO company_categories (company_id, category)
SELECT c.id, c.category
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM company_categories cc WHERE cc.company_id = c.id)
ON CONFLICT DO NOTHING;

-- Update the count function to include companies without junction table entries
CREATE OR REPLACE FUNCTION public.get_non_conference_company_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM companies WHERE category != 'conferences';
$$;
