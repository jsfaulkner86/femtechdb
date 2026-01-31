-- Update the process_founder_claim function to add free email provider blocklist
-- and strengthen domain validation

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
    -- Get company website
    SELECT website_url INTO company_website
    FROM public.companies
    WHERE id = NEW.company_id;
    
    -- Extract email domain
    email_domain := lower(split_part(NEW.user_email, '@', 2));
    
    -- Block free email providers from auto-approval
    IF email_domain = ANY(free_email_providers) THEN
        -- Keep as pending for manual review
        RETURN NEW;
    END IF;
    
    -- Extract website domain (remove protocol and www)
    IF company_website IS NOT NULL THEN
        website_domain := lower(regexp_replace(
            regexp_replace(company_website, '^https?://(www\.)?', ''),
            '/.*$', ''
        ));
        
        -- Stricter domain matching:
        -- 1. Exact match (email@company.com matches company.com)
        -- 2. Website is www. version of email domain (www.company.com matches company.com)
        -- 3. Email domain ends with website domain (user@subdomain.company.com matches company.com)
        --    But verify it's a proper subdomain (has . before the website domain)
        IF email_domain = website_domain 
           OR website_domain = 'www.' || email_domain
           OR (email_domain LIKE '%.' || website_domain AND length(email_domain) > length(website_domain) + 1) THEN
            NEW.domain_verified := true;
            NEW.status := 'approved';
            NEW.reviewed_at := now();
            
            -- Update company claimed_by
            UPDATE public.companies
            SET claimed_by = NEW.user_id
            WHERE id = NEW.company_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;