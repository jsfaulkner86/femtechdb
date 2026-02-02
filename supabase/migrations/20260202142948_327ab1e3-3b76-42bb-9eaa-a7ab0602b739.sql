-- Create junction table for company categories (many-to-many)
CREATE TABLE public.company_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category public.femtech_category NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (company_id, category)
);

-- Enable RLS
ALTER TABLE public.company_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view company categories"
ON public.company_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage company categories"
ON public.company_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders can manage their company categories"
ON public.company_categories
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = company_categories.company_id
        AND companies.claimed_by = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = company_categories.company_id
        AND companies.claimed_by = auth.uid()
    )
);

-- Migrate existing categories from companies table
INSERT INTO public.company_categories (company_id, category)
SELECT id, category FROM public.companies;

-- Create index for faster lookups
CREATE INDEX idx_company_categories_company_id ON public.company_categories(company_id);
CREATE INDEX idx_company_categories_category ON public.company_categories(category);