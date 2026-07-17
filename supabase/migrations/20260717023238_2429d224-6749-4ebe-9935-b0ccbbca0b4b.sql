
REVOKE SELECT ON public.companies FROM anon, authenticated;

GRANT SELECT (
  id, name, category, mission, problem, solution,
  headquarters, continent, country, state, founded_year,
  website_url, logo_url, is_verified, source_url,
  commercialization_phase, created_at, updated_at
) ON public.companies TO anon, authenticated;

GRANT SELECT ON public.companies TO service_role;

CREATE OR REPLACE FUNCTION public.process_founder_claim()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    company_website TEXT;
    email_domain TEXT;
    website_domain TEXT;
    free_email_providers TEXT[] := ARRAY[
        'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
        'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'protonmail.com', 'proton.me',
        'mail.com', 'zoho.com', 'yandex.com',
        'gmx.com', 'gmx.net', 'tutanota.com',
        'fastmail.com', 'hey.com', 'pm.me'
    ];
BEGIN
    -- Always discard any client-supplied privileged values before verification.
    NEW.status := 'pending';
    NEW.domain_verified := false;
    NEW.reviewed_at := NULL;

    SELECT website_url INTO company_website
    FROM public.companies
    WHERE id = NEW.company_id;

    email_domain := lower(split_part(NEW.user_email, '@', 2));

    IF email_domain = ANY(free_email_providers) THEN
        RETURN NEW;
    END IF;

    IF company_website IS NOT NULL THEN
        website_domain := lower(regexp_replace(
            regexp_replace(company_website, '^https?://(www\.)?', ''),
            '/.*$', ''
        ));

        IF email_domain = website_domain
           OR website_domain = 'www.' || email_domain
           OR (email_domain LIKE '%.' || website_domain AND length(email_domain) > length(website_domain) + 1) THEN
            NEW.domain_verified := true;
            NEW.status := 'approved';
            NEW.reviewed_at := now();

            UPDATE public.companies
            SET claimed_by = NEW.user_id
            WHERE id = NEW.company_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;
