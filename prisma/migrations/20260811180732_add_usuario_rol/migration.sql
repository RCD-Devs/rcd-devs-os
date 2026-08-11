-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" UUID NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "rol_id" UUID,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "titular_id" UUID,
    "reemplazo_id" UUID,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rol" ADD CONSTRAINT "Rol_titular_id_fkey" FOREIGN KEY ("titular_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rol" ADD CONSTRAINT "Rol_reemplazo_id_fkey" FOREIGN KEY ("reemplazo_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey (referencia a Supabase Auth; auth.users no esta gestionado por Prisma)
-- Si Supabase Auth elimina el usuario, la fila espejo en Usuario se elimina en cascada.
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

