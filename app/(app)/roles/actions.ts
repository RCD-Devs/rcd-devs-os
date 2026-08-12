"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";

async function requireAdmin() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    throw new Error("No autenticado");
  }
  if (!esAdmin(usuario)) {
    throw new Error("No autorizado: se requiere rol con acceso admin");
  }

  return usuario;
}

export async function actualizarAsignacionRol(
  rolId: string,
  campo: "titularId" | "reemplazoId",
  usuarioId: string | null,
) {
  const usuario = await requireAdmin();

  await prisma.rol.update({
    where: { id: rolId },
    data: { [campo]: usuarioId },
  });

  await registrarEvento({
    entidad: "Rol",
    entidadId: rolId,
    usuarioId: usuario.id,
    accion: "asignacion_actualizada",
    detalle: { campo, usuarioId },
  });

  revalidatePath("/roles");
}

export async function actualizarEsAdminRol(rolId: string, valor: boolean) {
  const usuario = await requireAdmin();

  await prisma.rol.update({ where: { id: rolId }, data: { esAdmin: valor } });

  await registrarEvento({
    entidad: "Rol",
    entidadId: rolId,
    usuarioId: usuario.id,
    accion: "permiso_admin_actualizado",
    detalle: { esAdmin: valor },
  });

  revalidatePath("/roles");
}
