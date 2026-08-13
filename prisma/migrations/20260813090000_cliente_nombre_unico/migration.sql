-- Evita clientes con el mismo nombre exacto (se elimino a mano un duplicado
-- vacio "AFP Habitat" antes de esta migracion; ver historial de git).
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_nombre_key" UNIQUE ("nombre");
