-- Add 'investors' category to the femtech_category enum
ALTER TYPE public.femtech_category ADD VALUE IF NOT EXISTS 'investors';