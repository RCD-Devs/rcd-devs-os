-- Comentarios por Solicitud (#16 de MEJORAS-PROPUESTAS.md), mismo criterio
-- que Comentario (comentarios por paso de checklist): tabla nueva con FK
-- directa, no polimorfica.

-- CreateTable
CREATE TABLE "ComentarioSolicitud" (
    "id" UUID NOT NULL,
    "solicitud_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioSolicitud_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComentarioSolicitud" ADD CONSTRAINT "ComentarioSolicitud_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "Solicitud"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioSolicitud" ADD CONSTRAINT "ComentarioSolicitud_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: mismo criterio que Comentario (cualquier autenticado lee/escribe,
-- sin UPDATE/DELETE porque no hay edicion de comentarios en la app).
ALTER TABLE "ComentarioSolicitud" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_comentario_solicitud" ON "ComentarioSolicitud"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_comentario_solicitud" ON "ComentarioSolicitud"
  FOR INSERT TO authenticated WITH CHECK (true);
