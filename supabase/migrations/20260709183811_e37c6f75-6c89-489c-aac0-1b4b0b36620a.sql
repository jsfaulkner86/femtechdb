
CREATE OR REPLACE FUNCTION public.prevent_founder_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := false;
BEGIN
  -- Service role bypasses this check entirely
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Admin users may change any field
  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admin (founder) updates: block changes to privileged columns
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    RAISE EXCEPTION 'Only admins can change is_verified';
  END IF;
  IF NEW.claimed_by IS DISTINCT FROM OLD.claimed_by THEN
    RAISE EXCEPTION 'Only admins can change claimed_by';
  END IF;
  IF NEW.source_url IS DISTINCT FROM OLD.source_url THEN
    RAISE EXCEPTION 'Only admins can change source_url';
  END IF;
  IF NEW.continent IS DISTINCT FROM OLD.continent THEN
    RAISE EXCEPTION 'Only admins can change continent';
  END IF;
  IF NEW.country IS DISTINCT FROM OLD.country THEN
    RAISE EXCEPTION 'Only admins can change country';
  END IF;
  IF NEW.state IS DISTINCT FROM OLD.state THEN
    RAISE EXCEPTION 'Only admins can change state';
  END IF;
  IF NEW.commercialization_phase IS DISTINCT FROM OLD.commercialization_phase THEN
    RAISE EXCEPTION 'Only admins can change commercialization_phase';
  END IF;
  IF NEW.category IS DISTINCT FROM OLD.category THEN
    RAISE EXCEPTION 'Only admins can change category';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_founder_privileged_updates_trg ON public.companies;
CREATE TRIGGER prevent_founder_privileged_updates_trg
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.prevent_founder_privileged_updates();
