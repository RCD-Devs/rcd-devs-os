"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

  // revalidatePath ya fuerza que /roles (esta pantalla) muestre el cambio de
  // inmediato en la misma respuesta. revalidateTag con perfil "max" es
  // stale-while-revalidate para el resto de las paginas que leen getRoles()
  // (/usuarios, /solicitudes): pueden servir el valor viejo una vista mas
  // antes de refrescar en segundo plano -- aceptable, los roles casi no
  // cambian.
  revalidatePath("/roles");
  revalidateTag("roles", "max");

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
  revalidateTag("roles", "max");

  return ok(null);
}
