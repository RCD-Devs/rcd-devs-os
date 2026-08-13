-- Un proyecto archivado sale del semaforo/alertas y de las listas por
-- defecto sin borrar nada (#15 de MEJORAS-PROPUESTAS.md).
ALTER TABLE "Proyecto" ADD COLUMN "archivado" BOOLEAN NOT NULL DEFAULT false;
