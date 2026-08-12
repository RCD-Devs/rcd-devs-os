"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export async function crearProyecto(input: {
  nombre: string;
  clienteId: string;
  etapaActualId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!input.nombre.trim() || !input.clienteId || !input.etapaActualId) {
    throw new Error("Nombre, cliente y etapa son requeridos");
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

  return proyecto;
}
