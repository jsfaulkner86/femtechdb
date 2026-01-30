-- Create founder_claims table to track claim requests
CREATE TABLE public.founder_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    domain_verified BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, user_id)
);

-- Add claimed_by column to companies table
ALTER TABLE public.companies ADD COLUMN claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.founder_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for founder_claims
CREATE POLICY "Users can view their own claims"
ON public.founder_claims
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create claims"
ON public.founder_claims
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all claims"
ON public.founder_claims
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update claims"
ON public.founder_claims
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete claims"
ON public.founder_claims
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update companies RLS to allow founders to update their claimed company
CREATE POLICY "Founders can update their claimed company"
ON public.companies
FOR UPDATE
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

-- Function to verify domain match and auto-approve claim
CREATE OR REPLACE FUNCTION public.process_founder_claim()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    company_website TEXT;
    email_domain TEXT;
    website_domain TEXT;
BEGIN
    -- Get company website
    SELECT website_url INTO company_website
    FROM public.companies
    WHERE id = NEW.company_id;
    
    -- Extract email domain
    email_domain := lower(split_part(NEW.user_email, '@', 2));
    
    -- Extract website domain (remove protocol and www)
    IF company_website IS NOT NULL THEN
        website_domain := lower(regexp_replace(
            regexp_replace(company_website, '^https?://(www\.)?', ''),
            '/.*$', ''
        ));
        
        -- Check if email domain matches website domain
        IF email_domain = website_domain OR website_domain LIKE '%.' || email_domain OR email_domain LIKE '%.' || website_domain THEN
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
$$;

-- Trigger to process claims on insert
CREATE TRIGGER on_founder_claim_insert
    BEFORE INSERT ON public.founder_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.process_founder_claim();