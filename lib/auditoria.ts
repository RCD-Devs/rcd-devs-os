import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Append-only (roadmap #6). Nunca lanza: un fallo al auditar no debe hacer
// fallar la operacion real que ya se aplico (ej. no tiene sentido que
// falle "cambiar etapa" porque no se pudo escribir el log de auditoria).
export async function registrarEvento(params: {
  entidad: string;
  entidadId: string;
  usuarioId: string | null;
  accion: string;
  detalle?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.eventoAuditoria.create({
      data: {
        entidad: params.entidad,
        entidadId: params.entidadId,
        usuarioId: params.usuarioId,
        accion: params.accion,
        detalle: params.detalle,
      },
    });
  } catch (error) {
    console.error("No se pudo registrar evento de auditoria", params, error);
  }
}
