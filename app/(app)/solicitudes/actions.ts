"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

export const ESTADOS_SOLICITUD = ["Pendiente", "En curso", "Resuelta", "Rechazada"];

export async function crearSolicitud(input: {
  proyectoId: string;
  tipo: string;
  descripcion: string;
  responsableRolId: string;
  slaFechaLimite: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  if (!input.proyectoId || !input.tipo.trim() || !input.responsableRolId) {
    return fail("Proyecto, tipo y rol responsable son requeridos");
  }

  const solicitud = await prisma.solicitud.create({
    data: {
      proyectoId: input.proyectoId,
      tipo: input.tipo.trim(),
      descripcion: input.descripcion.trim() || null,
      responsableRolId: input.responsableRolId,
      solicitanteId: user.id,
      slaFechaLimite: input.slaFechaLimite ? new Date(input.slaFechaLimite) : null,
    },
  });

  await registrarEvento({
    entidad: "Solicitud",
    entidadId: solicitud.id,
    usuarioId: user.id,
    accion: "creada",
    detalle: { tipo: solicitud.tipo, proyectoId: solicitud.proyectoId },
  });

  revalidatePath("/solicitudes");
  return ok({ id: solicitud.id });
}

export async function actualizarEstadoSolicitud(
  solicitudId: string,
  estado: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  if (!ESTADOS_SOLICITUD.includes(estado)) {
    return fail("Estado invalido");
  }

  await prisma.solicitud.update({ where: { id: solicitudId }, data: { estado } });

  await registrarEvento({
    entidad: "Solicitud",
    entidadId: solicitudId,
    usuarioId: user.id,
    accion: "cambio_estado",
    detalle: { estado },
  });

  revalidatePath("/solicitudes");

  return ok(null);
}
