-- ===========================================
-- MDF TOOLS — Schema completo
-- Pega esto en Supabase → SQL Editor → Run
-- ===========================================

-- BRAND PROFILES
CREATE TABLE IF NOT EXISTS brand_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_name text NOT NULL DEFAULT '',
  industry text DEFAULT '',
  products_services text DEFAULT '',
  target_audience text DEFAULT '',
  tone_of_voice text DEFAULT '',
  main_keywords text[] DEFAULT '{}',
  differentiators text DEFAULT '',
  web_url text DEFAULT '',
  social_media text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brand_profiles_policy" ON brand_profiles FOR ALL USING (auth.uid() = user_id);

-- AGENT CONTEXTS (el "cerebro" de cada agente)
CREATE TABLE IF NOT EXISTS agent_contexts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_type text NOT NULL,
  context_text text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_type)
);
ALTER TABLE agent_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_contexts_policy" ON agent_contexts FOR ALL USING (auth.uid() = user_id);

-- AGENT FILES (documentos subidos por usuario por agente)
CREATE TABLE IF NOT EXISTS agent_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer DEFAULT 0,
  extracted_text text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agent_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agent_files_policy" ON agent_files FOR ALL USING (auth.uid() = user_id);

-- CHAT HISTORY
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_type text NOT NULL,
  session_id uuid DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_history_policy" ON chat_history FOR ALL USING (auth.uid() = user_id);

-- PROPOSALS
CREATE TABLE IF NOT EXISTS proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL DEFAULT '',
  industry text DEFAULT '',
  form_data jsonb DEFAULT '{}',
  generated_content text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'negotiating', 'closed_won', 'closed_lost')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_policy" ON proposals FOR ALL USING (auth.uid() = user_id);

-- COMPETITOR ADS
CREATE TABLE IF NOT EXISTS competitor_ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text DEFAULT 'facebook',
  competitor_name text NOT NULL DEFAULT '',
  ad_content text DEFAULT '',
  ad_image_url text DEFAULT '',
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE competitor_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "competitor_ads_policy" ON competitor_ads FOR ALL USING (auth.uid() = user_id);

-- GSC PROPERTIES
CREATE TABLE IF NOT EXISTS gsc_properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_url text NOT NULL,
  client_name text DEFAULT '',
  access_token text DEFAULT '',
  refresh_token text DEFAULT '',
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE gsc_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gsc_properties_policy" ON gsc_properties FOR ALL USING (auth.uid() = user_id);

-- KEYWORD TRACKING
CREATE TABLE IF NOT EXISTS keyword_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES gsc_properties(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  target_url text DEFAULT '',
  current_position integer,
  previous_position integer,
  position_history jsonb DEFAULT '[]',
  monthly_volume integer,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE keyword_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "keyword_tracking_policy" ON keyword_tracking FOR ALL USING (auth.uid() = user_id);

-- SEO AUDITS
CREATE TABLE IF NOT EXISTS seo_audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES gsc_properties(id) ON DELETE CASCADE,
  audit_type text DEFAULT 'technical',
  raw_data jsonb DEFAULT '{}',
  ai_analysis text DEFAULT '',
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_audits_policy" ON seo_audits FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- STORAGE BUCKET para archivos de agentes
-- ===========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-files', 'agent-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload their files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agent-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view their files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'agent-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete their files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agent-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
