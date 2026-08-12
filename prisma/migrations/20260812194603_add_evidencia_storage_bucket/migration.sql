-- Bucket privado de Supabase Storage para adjuntar evidencia real a un paso
-- de checklist (hoy EjecucionPaso.evidencia_url es solo un link de texto
-- libre). No es una tabla de Prisma: storage.buckets/storage.objects son
-- schemas administrados por Supabase, fuera del control del ORM.
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencia', 'evidencia', false)
ON CONFLICT (id) DO NOTHING;

-- RLS ya viene habilitado por Supabase en storage.objects. Las policies de
-- abajo estan acotadas a bucket_id = 'evidencia', no tocan ningun otro
-- bucket que ya exista en el proyecto.
CREATE POLICY "authenticated_read_evidencia" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'evidencia');
CREATE POLICY "authenticated_upload_evidencia" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencia');
