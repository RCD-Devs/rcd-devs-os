"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

type ClienteInput = {
  nombre: string;
  contactoNombre: string;
  contactoEmail: string;
  contactoTelefono: string;
  rubro: string;
  sitioWeb: string;
  notas: string;
};

export async function crearCliente(
  data: ClienteInput,
): Promise<ActionResult<{ id: string; nombre: string }>> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }

  const nombre = data.nombre.trim();
  if (!nombre) {
    return fail("El nombre es requerido");
  }

  let cliente;
  try {
    cliente = await prisma.cliente.create({
      data: {
        nombre,
        contactoNombre: data.contactoNombre.trim() || null,
        contactoEmail: data.contactoEmail.trim() || null,
        contactoTelefono: data.contactoTelefono.trim() || null,
        rubro: data.rubro.trim() || null,
        sitioWeb: data.sitioWeb.trim() || null,
        notas: data.notas.trim() || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("Ya existe un cliente con ese nombre");
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Cliente",
    entidadId: cliente.id,
    usuarioId: usuario.id,
    accion: "creado",
    detalle: { nombre: cliente.nombre },
  });

  revalidatePath("/clientes");

  return ok({ id: cliente.id, nombre: cliente.nombre });
}

export async function actualizarCliente(
  clienteId: string,
  data: ClienteInput,
): Promise<ActionResult> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }

  const nombre = data.nombre.trim();
  if (!nombre) {
    return fail("El nombre es requerido");
  }

  try {
    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        nombre,
        contactoNombre: data.contactoNombre.trim() || null,
        contactoEmail: data.contactoEmail.trim() || null,
        contactoTelefono: data.contactoTelefono.trim() || null,
        rubro: data.rubro.trim() || null,
        sitioWeb: data.sitioWeb.trim() || null,
        notas: data.notas.trim() || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("Ya existe un cliente con ese nombre");
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Cliente",
    entidadId: clienteId,
    usuarioId: usuario.id,
    accion: "actualizado",
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);

  return ok(null);
}

export async function eliminarCliente(clienteId: string): Promise<ActionResult> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }
  if (!esAdmin(usuario)) {
    return fail("No autorizado: se requiere rol con acceso admin");
  }

  try {
    await prisma.cliente.delete({ where: { id: clienteId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return fail("No se puede eliminar: el cliente tiene proyectos asociados");
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Cliente",
    entidadId: clienteId,
    usuarioId: usuario.id,
    accion: "eliminado",
  });

  revalidatePath("/clientes");

  return ok(null);
}
