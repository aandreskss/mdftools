CREATE TABLE IF NOT EXISTS workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Nuevo Workflow',
  description text DEFAULT '',
  nodes jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workflows_policy" ON workflows FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
