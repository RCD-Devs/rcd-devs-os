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

export async function actualizarEmailUsuario(usuarioId: string, email: string) {
  const usuarioActual = await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error(
      "Editar usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  const correo = email.trim().toLowerCase();
  if (!correo) {
    throw new Error("El correo es requerido");
  }

  const { error } = await adminClient.auth.admin.updateUserById(usuarioId, {
    email: correo,
    email_confirm: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  await prisma.usuario.update({ where: { id: usuarioId }, data: { email: correo } });

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "email_actualizado",
    detalle: { email: correo },
  });

  revalidatePath("/usuarios");
}

export async function restablecerPasswordUsuario(usuarioId: string, password: string) {
  const usuarioActual = await requireAdmin();

  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error(
      "Restablecer contraseñas requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const { error } = await adminClient.auth.admin.updateUserById(usuarioId, { password });
  if (error) {
    throw new Error(error.message);
  }

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "password_restablecida",
  });

  revalidatePath("/usuarios");
}

export async function eliminarUsuario(usuarioId: string) {
  const usuarioActual = await requireAdmin();

  if (usuarioId === usuarioActual.id) {
    throw new Error("No puedes eliminar tu propia cuenta");
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error(
      "Eliminar usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  // Borra en auth.users; la fila espejo en public.Usuario cae en cascada
  // (fkey Usuario_id_fkey ON DELETE CASCADE). Si el usuario tiene
  // Solicitudes o Comentarios propios (ON DELETE RESTRICT), Postgres
  // rechaza el borrado y Supabase lo devuelve como error.
  const { error } = await adminClient.auth.admin.deleteUser(usuarioId);
  if (error) {
    throw new Error(error.message);
  }

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "eliminado",
  });

  revalidatePath("/usuarios");
}
