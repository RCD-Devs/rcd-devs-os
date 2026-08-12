"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export async function crearCliente(nombre: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!nombre.trim()) {
    throw new Error("El nombre es requerido");
  }

  const cliente = await prisma.cliente.create({ data: { nombre: nombre.trim() } });

  await registrarEvento({
    entidad: "Cliente",
    entidadId: cliente.id,
    usuarioId: user.id,
    accion: "creado",
    detalle: { nombre: cliente.nombre },
  });

  revalidatePath("/clientes");

  return cliente;
}
