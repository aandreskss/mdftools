-- Auditoría de seguridad RLS — gaps encontrados en revisión de Etapa 2.5

-- Fix 1: proposal_views no tenía RLS (omitido en migración 001)
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

-- Solo el dueño de la propuesta puede ver sus views
CREATE POLICY "proposal_views_owner_select" ON proposal_views
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM proposals WHERE user_id = auth.uid()
    )
  );

-- Fix 2: client-brief-files storage bucket sin política DELETE
-- Solo el owner de la carpeta (user_id/) puede borrar sus archivos
CREATE POLICY "client_brief_files_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client-brief-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
