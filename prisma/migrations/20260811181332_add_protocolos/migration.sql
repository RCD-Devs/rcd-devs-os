-- CreateTable
CREATE TABLE "Cliente" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etapa" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "gate_descripcion" TEXT NOT NULL,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "etapa_actual_id" UUID NOT NULL,
    "fecha_inicio" DATE,
    "fecha_compromiso" DATE,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Protocolo" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "alcance" TEXT NOT NULL,

    CONSTRAINT "Protocolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionProtocolo" (
    "id" UUID NOT NULL,
    "protocolo_id" UUID NOT NULL,
    "numero_version" INTEGER NOT NULL,
    "fecha_publicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pasos_json" JSONB NOT NULL,
    "estados_json" JSONB NOT NULL,

    CONSTRAINT "VersionProtocolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjecucionProtocolo" (
    "id" UUID NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "version_protocolo_id" UUID NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'En curso',
    "fecha_limite" DATE,

    CONSTRAINT "EjecucionProtocolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EjecucionPaso" (
    "id" UUID NOT NULL,
    "ejecucion_id" UUID NOT NULL,
    "paso_nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "responsable_id" UUID,
    "evidencia_url" TEXT,
    "fecha_ejecucion" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "EjecucionPaso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_nombre_key" ON "Etapa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_orden_key" ON "Etapa"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "Protocolo_nombre_key" ON "Protocolo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "VersionProtocolo_protocolo_id_numero_version_key" ON "VersionProtocolo"("protocolo_id", "numero_version");

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_etapa_actual_id_fkey" FOREIGN KEY ("etapa_actual_id") REFERENCES "Etapa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionProtocolo" ADD CONSTRAINT "VersionProtocolo_protocolo_id_fkey" FOREIGN KEY ("protocolo_id") REFERENCES "Protocolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjecucionProtocolo" ADD CONSTRAINT "EjecucionProtocolo_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjecucionProtocolo" ADD CONSTRAINT "EjecucionProtocolo_version_protocolo_id_fkey" FOREIGN KEY ("version_protocolo_id") REFERENCES "VersionProtocolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjecucionPaso" ADD CONSTRAINT "EjecucionPaso_ejecucion_id_fkey" FOREIGN KEY ("ejecucion_id") REFERENCES "EjecucionProtocolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EjecucionPaso" ADD CONSTRAINT "EjecucionPaso_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS: solo EjecucionProtocolo y EjecucionPaso (spec de Protocolos, decision de
-- brainstorming: cualquier usuario autenticado puede leer/escribir, sin gate por
-- rol todavia; RLS aca bloquea acceso anonimo/directo, no diferencia roles).
ALTER TABLE "EjecucionProtocolo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EjecucionPaso" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_ejecucion_protocolo" ON "EjecucionProtocolo"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_ejecucion_protocolo" ON "EjecucionProtocolo"
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_ejecucion_protocolo" ON "EjecucionProtocolo"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_ejecucion_paso" ON "EjecucionPaso"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_ejecucion_paso" ON "EjecucionPaso"
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_ejecucion_paso" ON "EjecucionPaso"
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
