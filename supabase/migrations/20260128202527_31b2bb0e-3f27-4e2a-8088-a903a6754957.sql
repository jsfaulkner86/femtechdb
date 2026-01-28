-- Create company_submissions table for user-submitted companies
CREATE TABLE public.company_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website_url TEXT,
  category TEXT NOT NULL,
  description TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.company_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (insert) a company
CREATE POLICY "Anyone can submit companies"
ON public.company_submissions
FOR INSERT
WITH CHECK (true);

-- Only admins can view, update, delete submissions
CREATE POLICY "Admins can view all submissions"
ON public.company_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
ON public.company_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions"
ON public.company_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));