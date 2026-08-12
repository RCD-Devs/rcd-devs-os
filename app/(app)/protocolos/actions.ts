"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@/app/generated/prisma/client";
import { registrarEvento } from "@/lib/auditoria";

// Estados fijos del constructor simple: mismo set que "Elementos basicos de
// sitio web". No hay UI para definir estados personalizados en este pase
// (ver spec de Protocolos y feedback del usuario: "constructor simple").
const ESTADOS_ESTANDAR = ["Pendiente", "En curso", "Completo", "No aplica"];

export async function crearProtocolo(input: {
  nombre: string;
  objetivo: string;
  alcance: string;
  pasos: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const nombre = input.nombre.trim();
  const pasos = input.pasos.map((p) => p.trim()).filter(Boolean);

  if (!nombre || !input.objetivo.trim()) {
    throw new Error("Nombre y objetivo son requeridos");
  }

  if (pasos.length === 0) {
    throw new Error("Agrega al menos un paso al checklist");
  }

  let protocolo;
  try {
    protocolo = await prisma.$transaction(async (tx) => {
      const nuevoProtocolo = await tx.protocolo.create({
        data: { nombre, objetivo: input.objetivo.trim(), alcance: input.alcance.trim() },
      });

      await tx.versionProtocolo.create({
        data: {
          protocoloId: nuevoProtocolo.id,
          numeroVersion: 1,
          pasosJson: pasos.map((p) => ({ nombre: p })),
          estadosJson: ESTADOS_ESTANDAR,
        },
      });

      return nuevoProtocolo;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Ya existe un protocolo con ese nombre");
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Protocolo",
    entidadId: protocolo.id,
    usuarioId: user.id,
    accion: "creado",
    detalle: { nombre: protocolo.nombre, pasos: pasos.length },
  });

  revalidatePath("/protocolos");

  return protocolo;
}
