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

export async function crearUsuario(email: string, password: string, rolId: string) {
  const usuarioActual = await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error(
      "Crear usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  const correo = email.trim().toLowerCase();
  if (!correo) {
    throw new Error("El correo es requerido");
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  // El trigger de Supabase (trigger_usuario_sync) crea la fila espejo en
  // Usuario al crear la cuenta; si por algun motivo no corrio todavia, se
  // crea aca para poder asignarle el rol de inmediato.
  const nuevoId = data.user.id;
  await prisma.usuario.upsert({
    where: { id: nuevoId },
    update: rolId ? { rolId } : {},
    create: { id: nuevoId, email: correo, rolId: rolId || null },
  });

  await registrarEvento({
    entidad: "Usuario",
    entidadId: nuevoId,
    usuarioId: usuarioActual.id,
    accion: "creado",
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
