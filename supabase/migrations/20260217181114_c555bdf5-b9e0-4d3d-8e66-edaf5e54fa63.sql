
-- Create translations cache table
CREATE TABLE public.translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_text text NOT NULL,
  language_code text NOT NULL,
  translated_text text NOT NULL,
  context text DEFAULT 'ui',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(source_text, language_code)
);

-- Index for fast lookups
CREATE INDEX idx_translations_lookup ON public.translations(language_code, source_text);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read translations (public site)
CREATE POLICY "Anyone can read translations"
ON public.translations
FOR SELECT
USING (true);

-- Only service role / edge functions can insert translations (no user policy needed)
-- The edge function uses service role key
