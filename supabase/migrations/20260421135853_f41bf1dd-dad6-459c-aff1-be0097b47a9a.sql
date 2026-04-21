
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP POLICY IF EXISTS "ressources_storage_read" ON storage.objects;
CREATE POLICY "ressources_storage_read" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'ressources');
