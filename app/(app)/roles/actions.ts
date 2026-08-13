"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

async function requireAdmin(): Promise<
  ActionResult<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>>
> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }
  if (!esAdmin(usuario)) {
    return fail("No autorizado: se requiere rol con acceso admin");
  }

  return ok(usuario);
}

export async function actualizarAsignacionRol(
  rolId: string,
  campo: "titularId" | "reemplazoId",
  usuarioId: string | null,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  await prisma.rol.update({
    where: { id: rolId },
    data: { [campo]: usuarioId },
  });

  await registrarEvento({
    entidad: "Rol",
    entidadId: rolId,
    usuarioId: auth.data.id,
    accion: "asignacion_actualizada",
    detalle: { campo, usuarioId },
  });

  revalidatePath("/roles");

  return ok(null);
}

export async function actualizarEsAdminRol(rolId: string, valor: boolean): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  await prisma.rol.update({ where: { id: rolId }, data: { esAdmin: valor } });

  await registrarEvento({
    entidad: "Rol",
    entidadId: rolId,
    usuarioId: auth.data.id,
    accion: "permiso_admin_actualizado",
    detalle: { esAdmin: valor },
  });

  revalidatePath("/roles");

  return ok(null);
}
