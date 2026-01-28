-- Add new femtech category enum values
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'reproductive_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'maternal_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'hormonal_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'gynecological_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'endometriosis';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'heart_disease';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'pelvic_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'bone_health';
ALTER TYPE femtech_category ADD VALUE IF NOT EXISTS 'cancer';