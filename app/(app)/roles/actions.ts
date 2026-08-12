"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export async function actualizarAsignacionRol(
  rolId: string,
  campo: "titularId" | "reemplazoId",
  usuarioId: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  await prisma.rol.update({
    where: { id: rolId },
    data: { [campo]: usuarioId },
  });

  await registrarEvento({
    entidad: "Rol",
    entidadId: rolId,
    usuarioId: user.id,
    accion: "asignacion_actualizada",
    detalle: { campo, usuarioId },
  });

  revalidatePath("/roles");
}
