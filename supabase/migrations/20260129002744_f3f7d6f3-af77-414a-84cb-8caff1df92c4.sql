-- Add geographic columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS continent text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS state text;

-- Add mobile_apps to the femtech_category enum
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'mobile_apps';

-- Create indexes for geographic filtering
CREATE INDEX IF NOT EXISTS idx_companies_continent ON public.companies(continent);
CREATE INDEX IF NOT EXISTS idx_companies_country ON public.companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_state ON public.companies(state);