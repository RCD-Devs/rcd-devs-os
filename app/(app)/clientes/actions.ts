"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";

export async function crearCliente(nombre: string) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    throw new Error("No autenticado");
  }

  if (!nombre.trim()) {
    throw new Error("El nombre es requerido");
  }

  const cliente = await prisma.cliente.create({ data: { nombre: nombre.trim() } });

  await registrarEvento({
    entidad: "Cliente",
    entidadId: cliente.id,
    usuarioId: usuario.id,
    accion: "creado",
    detalle: { nombre: cliente.nombre },
  });

  revalidatePath("/clientes");

  return cliente;
}

export async function actualizarCliente(
  clienteId: string,
  data: {
    nombre: string;
    contactoNombre: string;
    contactoEmail: string;
    contactoTelefono: string;
    rubro: string;
    sitioWeb: string;
    notas: string;
  },
) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    throw new Error("No autenticado");
  }

  const nombre = data.nombre.trim();
  if (!nombre) {
    throw new Error("El nombre es requerido");
  }

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

  await registrarEvento({
    entidad: "Cliente",
    entidadId: clienteId,
    usuarioId: usuario.id,
    accion: "actualizado",
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
}

export async function eliminarCliente(clienteId: string) {
  const usuario = await getCurrentUser();

  if (!usuario) {
    throw new Error("No autenticado");
  }
  if (!esAdmin(usuario)) {
    throw new Error("No autorizado: se requiere rol con acceso admin");
  }

  try {
    await prisma.cliente.delete({ where: { id: clienteId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("No se puede eliminar: el cliente tiene proyectos asociados");
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
}
