-- Proposal branding fields for brand_profiles
ALTER TABLE brand_profiles
  ADD COLUMN IF NOT EXISTS logo_url              text DEFAULT '',
  ADD COLUMN IF NOT EXISTS brand_primary_color   text DEFAULT '#7C3AED',
  ADD COLUMN IF NOT EXISTS brand_secondary_color text DEFAULT '#EC4899',
  ADD COLUMN IF NOT EXISTS proposal_sender_name  text DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_conditions      text DEFAULT '';
