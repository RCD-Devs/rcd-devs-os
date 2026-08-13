-- Multiples adjuntos por paso (#11 de MEJORAS-PROPUESTAS.md). No toca
-- EjecucionPaso.evidencia_url (queda como legacy, sin migrar datos).

-- CreateTable
CREATE TABLE "EvidenciaPaso" (
    "id" UUID NOT NULL,
    "ejecucion_paso_id" UUID NOT NULL,
    "valor" TEXT NOT NULL,
    "creado_por_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenciaPaso_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EvidenciaPaso" ADD CONSTRAINT "EvidenciaPaso_ejecucion_paso_id_fkey" FOREIGN KEY ("ejecucion_paso_id") REFERENCES "EjecucionPaso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenciaPaso" ADD CONSTRAINT "EvidenciaPaso_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS: mismo criterio que Comentario (cualquier autenticado lee/escribe).
-- Se agrega DELETE ademas de SELECT/INSERT porque a diferencia de los
-- comentarios, quitar un adjunto individual es parte normal del flujo.
ALTER TABLE "EvidenciaPaso" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_evidencia_paso" ON "EvidenciaPaso"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_evidencia_paso" ON "EvidenciaPaso"
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_delete_evidencia_paso" ON "EvidenciaPaso"
  FOR DELETE TO authenticated USING (true);
