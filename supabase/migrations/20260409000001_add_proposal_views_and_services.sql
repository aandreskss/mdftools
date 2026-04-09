-- Proposal view tracking
CREATE TABLE IF NOT EXISTS proposal_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  ip_hash text DEFAULT '',
  device text DEFAULT '',
  user_agent text DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal_id ON proposal_views(proposal_id);

-- Service Library
CREATE TABLE IF NOT EXISTS service_library (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL DEFAULT 'marketing' CHECK (category IN ('marketing', 'design', 'sales')),
  service_name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  default_price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  deliverables text[] DEFAULT '{}',
  is_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE service_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_library_policy" ON service_library FOR ALL USING (auth.uid() = user_id);

-- Add html_content and slides_content columns to proposals if missing
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS html_content text DEFAULT '';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS slides_content text DEFAULT '';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS html_expires_at timestamptz;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
-- Update status constraint to include 'generada'
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('draft', 'generada', 'sent', 'negotiating', 'closed_won', 'closed_lost'));
