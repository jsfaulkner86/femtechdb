-- Add 'resources_community' category to the femtech_category enum
ALTER TYPE public.femtech_category ADD VALUE IF NOT EXISTS 'resources_community';