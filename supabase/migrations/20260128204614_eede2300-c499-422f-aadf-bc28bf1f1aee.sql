-- Add source_url column to store citation/reference links
ALTER TABLE public.companies 
ADD COLUMN source_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.companies.source_url IS 'URL to source for company information (e.g., Crunchbase, LinkedIn, press release)';