-- AlterTable: nuevos campos de contacto en Cliente
ALTER TABLE "Cliente" ADD COLUMN "contacto_nombre" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "contacto_email" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "contacto_telefono" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "rubro" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "sitio_web" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "notas" TEXT;

-- CreateTable
CREATE TABLE "RolPermiso" (
    "id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "recurso" TEXT NOT NULL,
    "accion" TEXT NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolPermiso_rol_id_recurso_accion_key" ON "RolPermiso"("rol_id", "recurso", "accion");

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS: mismo criterio que el resto de las tablas de esta app.
ALTER TABLE "RolPermiso" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_rol_permiso" ON "RolPermiso"
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write_rol_permiso" ON "RolPermiso"
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_delete_rol_permiso" ON "RolPermiso"
  FOR DELETE TO authenticated USING (true);
