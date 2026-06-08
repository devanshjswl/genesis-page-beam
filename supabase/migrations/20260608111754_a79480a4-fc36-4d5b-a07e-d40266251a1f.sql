
-- Fix search_path on trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict has_role to only be callable by authenticated (used inside RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Storage policies for project images bucket
CREATE POLICY "Public read project images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-images');
CREATE POLICY "Admins upload project images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update project images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete project images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.has_role(auth.uid(), 'admin'));
