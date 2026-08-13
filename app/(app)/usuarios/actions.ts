"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function crearUsuario(
  email: string,
  password: string,
  rolId: string,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const usuarioActual = auth.data;

  const adminClient = createAdminClient();
  if (!adminClient) {
    return fail("Crear usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno");
  }

  const correo = email.trim().toLowerCase();
  if (!correo) {
    return fail("El correo es requerido");
  }
  if (password.length < 8) {
    return fail("La contraseña debe tener al menos 8 caracteres");
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  });
  if (error) {
    return fail(error.message);
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

  return ok(null);
}

export async function actualizarRolUsuario(usuarioId: string, rolId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const usuarioActual = auth.data;

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

  return ok(null);
}

export async function actualizarEmailUsuario(usuarioId: string, email: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const usuarioActual = auth.data;

  const adminClient = createAdminClient();
  if (!adminClient) {
    return fail("Editar usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno");
  }

  const correo = email.trim().toLowerCase();
  if (!correo) {
    return fail("El correo es requerido");
  }

  const { error } = await adminClient.auth.admin.updateUserById(usuarioId, {
    email: correo,
    email_confirm: true,
  });
  if (error) {
    return fail(error.message);
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

  return ok(null);
}

export async function restablecerPasswordUsuario(
  usuarioId: string,
  password: string,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const usuarioActual = auth.data;

  const adminClient = createAdminClient();
  if (!adminClient) {
    return fail(
      "Restablecer contraseñas requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno",
    );
  }

  if (password.length < 8) {
    return fail("La contraseña debe tener al menos 8 caracteres");
  }

  const { error } = await adminClient.auth.admin.updateUserById(usuarioId, { password });
  if (error) {
    return fail(error.message);
  }

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "password_restablecida",
  });

  revalidatePath("/usuarios");

  return ok(null);
}

export async function eliminarUsuario(usuarioId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const usuarioActual = auth.data;

  if (usuarioId === usuarioActual.id) {
    return fail("No puedes eliminar tu propia cuenta");
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return fail("Eliminar usuarios requiere SUPABASE_SERVICE_ROLE_KEY configurada en las variables de entorno");
  }

  // Borra en auth.users; la fila espejo en public.Usuario cae en cascada
  // (fkey Usuario_id_fkey ON DELETE CASCADE). Si el usuario tiene
  // Solicitudes o Comentarios propios (ON DELETE RESTRICT), Postgres
  // rechaza el borrado y Supabase lo devuelve como error.
  const { error } = await adminClient.auth.admin.deleteUser(usuarioId);
  if (error) {
    return fail(error.message);
  }

  await registrarEvento({
    entidad: "Usuario",
    entidadId: usuarioId,
    usuarioId: usuarioActual.id,
    accion: "eliminado",
  });

  revalidatePath("/usuarios");

  return ok(null);
}
