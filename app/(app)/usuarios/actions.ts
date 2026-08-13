"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function invitarUsuario(email: string, rolId: string) {
  const usuarioActual = await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error(
      "Invitar usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  const correo = email.trim().toLowerCase();
  if (!correo) {
    throw new Error("El correo es requerido");
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(correo);
  if (error) {
    throw new Error(error.message);
  }

  // El trigger de Supabase (trigger_usuario_sync) crea la fila espejo en
  // Usuario al invitar; si por algun motivo no corrio todavia, se crea aca
  // para poder asignarle el rol de inmediato.
  const invitedId = data.user.id;
  await prisma.usuario.upsert({
    where: { id: invitedId },
    update: rolId ? { rolId } : {},
    create: { id: invitedId, email: correo, rolId: rolId || null },
  });

  await registrarEvento({
    entidad: "Usuario",
    entidadId: invitedId,
    usuarioId: usuarioActual.id,
    accion: "invitado",
    detalle: { email: correo, rolId: rolId || null },
  });

  revalidatePath("/usuarios");
}

export async function actualizarRolUsuario(usuarioId: string, rolId: string) {
  const usuarioActual = await requireAdmin();

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { rolId: rolId || null },
  });

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "rol_actualizado",
    detalle: { rolId: rolId || null },
  });

  revalidatePath("/usuarios");
}
