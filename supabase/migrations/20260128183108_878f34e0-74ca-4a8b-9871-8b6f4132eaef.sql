-- Enable the pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Allow service role to insert companies (for edge function)
CREATE POLICY "Service role can insert companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to update companies
CREATE POLICY "Service role can update companies"
  ON public.companies
  FOR UPDATE
  USING (true);
