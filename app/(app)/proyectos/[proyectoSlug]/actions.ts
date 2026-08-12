"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export async function actualizarEtapaProyecto(
  proyectoId: string,
  etapaId: string,
  proyectoSlug: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
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
}
