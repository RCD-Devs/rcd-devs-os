"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

export async function crearProyecto(input: {
  nombre: string;
  clienteId: string;
  etapaActualId: string;
}): Promise<ActionResult<{ id: string; nombre: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  if (!input.nombre.trim() || !input.clienteId || !input.etapaActualId) {
    return fail("Nombre, cliente y etapa son requeridos");
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: input.nombre.trim(),
      clienteId: input.clienteId,
      etapaActualId: input.etapaActualId,
    },
  });

  await registrarEvento({
    entidad: "Proyecto",
    entidadId: proyecto.id,
    usuarioId: user.id,
    accion: "creado",
    detalle: { nombre: proyecto.nombre },
  });

  revalidatePath("/proyectos");

  return ok({ id: proyecto.id, nombre: proyecto.nombre });
}
