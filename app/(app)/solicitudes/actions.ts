"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export const ESTADOS_SOLICITUD = ["Pendiente", "En curso", "Resuelta", "Rechazada"];

export async function crearSolicitud(input: {
  proyectoId: string;
  tipo: string;
  descripcion: string;
  responsableRolId: string;
  slaFechaLimite: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!input.proyectoId || !input.tipo.trim() || !input.responsableRolId) {
    throw new Error("Proyecto, tipo y rol responsable son requeridos");
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
  return solicitud;
}

export async function actualizarEstadoSolicitud(solicitudId: string, estado: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!ESTADOS_SOLICITUD.includes(estado)) {
    throw new Error("Estado invalido");
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
}
