-- ===========================================
-- STORAGE BUCKET para logos de marca (propuestas)
-- Debe ser público para que los logos aparezcan en el HTML de propuestas
-- ===========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal-logos', 'proposal-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permite a usuarios autenticados subir su propio logo (carpeta = su user_id)
DROP POLICY IF EXISTS "Users can upload their logo" ON storage.objects;
CREATE POLICY "Users can upload their logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proposal-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permite lectura pública (necesario para que aparezca en propuestas HTML)
DROP POLICY IF EXISTS "Public can read logos" ON storage.objects;
CREATE POLICY "Public can read logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'proposal-logos');

-- Permite a usuarios actualizar/eliminar su propio logo
DROP POLICY IF EXISTS "Users can update their logo" ON storage.objects;
CREATE POLICY "Users can update their logo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'proposal-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their logo" ON storage.objects;
CREATE POLICY "Users can delete their logo" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proposal-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
