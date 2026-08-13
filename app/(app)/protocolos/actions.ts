"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { registrarEvento } from "@/lib/auditoria";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { puedeCrear } from "@/lib/auth/permisos";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

// Estados fijos del constructor simple: mismo set que "Elementos basicos de
// sitio web". No hay UI para definir estados personalizados en este pase
// (ver spec de Protocolos y feedback del usuario: "constructor simple").
const ESTADOS_ESTANDAR = ["Pendiente", "En curso", "Completo", "No aplica"];

export async function crearProtocolo(input: {
  nombre: string;
  objetivo: string;
  alcance: string;
  pasos: string[];
}): Promise<ActionResult<{ id: string; nombre: string }>> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }
  if (!(await puedeCrear(usuario, "protocolos"))) {
    return fail("Tu rol no tiene permiso para crear protocolos");
  }

  const nombre = input.nombre.trim();
  const pasos = input.pasos.map((p) => p.trim()).filter(Boolean);

  if (!nombre || !input.objetivo.trim()) {
    return fail("Nombre y objetivo son requeridos");
  }

  if (pasos.length === 0) {
    return fail("Agrega al menos un paso al checklist");
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
      return fail("Ya existe un protocolo con ese nombre");
    }
    throw error;
  }

  await registrarEvento({
    entidad: "Protocolo",
    entidadId: protocolo.id,
    usuarioId: usuario.id,
    accion: "creado",
    detalle: { nombre: protocolo.nombre, pasos: pasos.length },
  });

  revalidatePath("/protocolos");

  return ok({ id: protocolo.id, nombre: protocolo.nombre });
}

// Nombre "Nombre (copia)", y si ya existe "Nombre (copia 2)", "(copia 3)"...
// Protocolo.nombre es unico a nivel de base de datos, asi que hace falta
// resolver la colision antes del insert en vez de dejar que P2002 la agarre.
async function nombreCopiaDisponible(nombreBase: string): Promise<string> {
  const existentes = new Set(
    (
      await prisma.protocolo.findMany({
        where: { nombre: { startsWith: `${nombreBase} (copia` } },
        select: { nombre: true },
      })
    ).map((p) => p.nombre),
  );

  let candidato = `${nombreBase} (copia)`;
  let n = 2;
  while (existentes.has(candidato)) {
    candidato = `${nombreBase} (copia ${n})`;
    n++;
  }
  return candidato;
}

export async function duplicarProtocolo(
  protocoloId: string,
): Promise<ActionResult<{ nombre: string }>> {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return fail("No autenticado");
  }
  if (!(await puedeCrear(usuario, "protocolos"))) {
    return fail("Tu rol no tiene permiso para crear protocolos");
  }

  const origen = await prisma.protocolo.findUnique({
    where: { id: protocoloId },
    include: { versiones: { orderBy: { numeroVersion: "desc" }, take: 1 } },
  });

  if (!origen) {
    return fail("Protocolo no encontrado");
  }

  const versionVigente = origen.versiones[0];
  if (!versionVigente) {
    return fail("Este protocolo todavia no tiene una version publicada para duplicar");
  }

  const nombre = await nombreCopiaDisponible(origen.nombre);

  const copia = await prisma.$transaction(async (tx) => {
    const nuevoProtocolo = await tx.protocolo.create({
      data: { nombre, objetivo: origen.objetivo, alcance: origen.alcance },
    });

    await tx.versionProtocolo.create({
      data: {
        protocoloId: nuevoProtocolo.id,
        numeroVersion: 1,
        pasosJson: versionVigente.pasosJson as Prisma.InputJsonValue,
        estadosJson: versionVigente.estadosJson as Prisma.InputJsonValue,
      },
    });

    return nuevoProtocolo;
  });

  await registrarEvento({
    entidad: "Protocolo",
    entidadId: copia.id,
    usuarioId: usuario.id,
    accion: "duplicado",
    detalle: { origenId: origen.id, origenNombre: origen.nombre },
  });

  revalidatePath("/protocolos");

  return ok({ nombre: copia.nombre });
}
