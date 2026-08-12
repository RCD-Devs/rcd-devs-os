-- Migracion escrita a mano: `prisma migrate diff` contra la base real falla
-- (P4002) porque Usuario.id referencia auth.users (schema de Supabase Auth,
-- fuera del control de Prisma) y el diff no puede resolver esa referencia
-- cruzada sin declarar el schema "auth" en el datasource. El contenido de
-- este archivo es equivalente al que Prisma habria generado: solo agrega
-- tablas nuevas, no toca ninguna existente.

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "solicitante_id" UUID NOT NULL,
    "responsable_rol_id" UUID NOT NULL,
    "sla_fecha_limite" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoAuditoria" (
    "id" UUID NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" UUID NOT NULL,
    "usuario_id" UUID,
    "accion" TEXT NOT NULL,
    "detalle" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" UUID NOT NULL,
    "ejecucion_paso_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoAuditoria_entidad_entidad_id_idx" ON "EventoAuditoria"("entidad", "entidad_id");

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_responsable_rol_id_fkey" FOREIGN KEY ("responsable_rol_id") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoAuditoria" ADD CONSTRAINT "EventoAuditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_ejecucion_paso_id_fkey" FOREIGN KEY ("ejecucion_paso_id") REFERENCES "EjecucionPaso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: mismo criterio que la migracion add_protocolos (cualquier usuario
-- autenticado puede leer/escribir, sin gate por rol todavia).
ALTER TABLE "Solicitud" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comentario" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_solicitud" ON "Solicitud"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_solicitud" ON "Solicitud"
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_solicitud" ON "Solicitud"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_comentario" ON "Comentario"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_comentario" ON "Comentario"
  FOR INSERT TO authenticated WITH CHECK (true);

-- EventoAuditoria es append-only por diseño (roadmap #6: "nunca se borra ni
-- edita"): solo se habilitan policies de lectura e insercion, sin UPDATE ni
-- DELETE — se enforcea a nivel de base de datos, no solo por convencion en
-- el codigo de la app.
ALTER TABLE "EventoAuditoria" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_evento_auditoria" ON "EventoAuditoria"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_evento_auditoria" ON "EventoAuditoria"
  FOR INSERT TO authenticated WITH CHECK (true);
