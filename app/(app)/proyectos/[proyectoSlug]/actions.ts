"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@/app/generated/prisma/client";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

export async function actualizarEtapaProyecto(
  proyectoId: string,
  etapaId: string,
  proyectoSlug: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  const proyectoAnterior = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    select: { etapaActualId: true },
  });

  await prisma.proyecto.update({
    where: { id: proyectoId },
    data: { etapaActualId: etapaId },
  });

  await registrarEvento({
    entidad: "Proyecto",
    entidadId: proyectoId,
    usuarioId: user.id,
    accion: "cambio_etapa",
    detalle: { etapaAnteriorId: proyectoAnterior?.etapaActualId ?? null, etapaNuevaId: etapaId },
  });

  // El slug de la URL depende del nombre del proyecto (no de la etapa), asi
  // que revalidar con el id crudo apuntaria a una ruta que ya no existe.
  revalidatePath(`/proyectos/${proyectoSlug}`);

  return ok(null);
}

export async function eliminarProyecto(proyectoId: string): Promise<ActionResult> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }
  if (!esAdmin(usuario)) {
    return fail("No autorizado: se requiere rol con acceso admin");
  }

  try {
    await prisma.proyecto.delete({ where: { id: proyectoId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return fail(
        "No se puede eliminar: el proyecto tiene ejecuciones de protocolo o solicitudes asociadas",
      );
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Proyecto",
    entidadId: proyectoId,
    usuarioId: usuario.id,
    accion: "eliminado",
  });

  revalidatePath("/proyectos");

  return ok(null);
}
