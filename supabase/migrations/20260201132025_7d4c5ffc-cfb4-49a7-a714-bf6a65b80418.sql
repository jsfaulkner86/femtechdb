-- Create enum for commercialization phases
CREATE TYPE public.commercialization_phase AS ENUM (
  'pre_seed',
  'seed',
  'early',
  'growth',
  'expansion_late',
  'exit_ipo'
);

-- Add commercialization_phase column to companies table
ALTER TABLE public.companies 
ADD COLUMN commercialization_phase public.commercialization_phase NULL;