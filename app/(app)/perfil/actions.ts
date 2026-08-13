"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

export async function actualizarPerfil(nombre: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) {
    return fail("El nombre no puede estar vacio");
  }

  // Siempre sobre el usuario de la sesion actual (user.id), nunca un id que
  // venga del cliente: nadie deberia poder editar el perfil de otra persona.
  await prisma.usuario.update({
    where: { id: user.id },
    data: { nombre: nombreLimpio },
  });

  await registrarEvento({
    entidad: "Usuario",
    entidadId: user.id,
    usuarioId: user.id,
    accion: "perfil_actualizado",
    detalle: { nombre: nombreLimpio },
  });

  revalidatePath("/perfil");
  revalidatePath("/dashboard");

  return ok(null);
}
