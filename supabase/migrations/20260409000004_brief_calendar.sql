-- Brief & Calendar columns for design proposals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS brief_data     jsonb  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS calendar_data  jsonb  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS brief_status   text   DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS brief_token    text   DEFAULT NULL;

-- Fast lookup by token (public link)
CREATE INDEX IF NOT EXISTS proposals_brief_token_idx ON proposals(brief_token);
