-- Client Brief: cuestionario de exploración enviado al cliente ANTES de crear la propuesta

CREATE TABLE IF NOT EXISTS client_briefs (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name     text    NOT NULL DEFAULT '',
  client_email    text    DEFAULT '',
  project_name    text    DEFAULT '',
  token           text    UNIQUE NOT NULL,
  questions       jsonb   NOT NULL DEFAULT '[]',
  responses       jsonb   DEFAULT NULL,
  files           jsonb   DEFAULT '[]',   -- [{questionId, url, name, size}]
  status          text    DEFAULT 'pending' CHECK (status IN ('pending', 'submitted')),
  submitted_at    timestamptz DEFAULT NULL,
  proposal_id     uuid    DEFAULT NULL,   -- se llena cuando se crea la propuesta
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_briefs_token_idx   ON client_briefs(token);
CREATE INDEX IF NOT EXISTS client_briefs_user_idx    ON client_briefs(user_id);
CREATE INDEX IF NOT EXISTS client_briefs_status_idx  ON client_briefs(status);

-- RLS
ALTER TABLE client_briefs ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados solo ven los suyos
CREATE POLICY "client_briefs_owner" ON client_briefs
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket para archivos que sube el cliente
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-brief-files', 'client-brief-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "client_brief_files_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-brief-files');

CREATE POLICY "client_brief_files_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-brief-files');
