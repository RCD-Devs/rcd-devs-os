"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { slugify } from "@/lib/slug";
import { ok, fail, type ActionResult } from "@/lib/actionResult";

// "Editar" un protocolo publicado siempre crea una version nueva, nunca muta
// la vigente: es justo lo que el versionado del roadmap busca evitar (un
// proyecto que arranco con v1 no debe cambiar de checklist bajo los pies).
export async function crearNuevaVersionProtocolo(
  protocoloId: string,
  pasosNombres: string[],
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("No autenticado");
  }

  const pasosLimpios = pasosNombres.map((p) => p.trim()).filter(Boolean);
  if (pasosLimpios.length === 0) {
    return fail("Agrega al menos un paso al checklist");
  }

  const versionVigente = await prisma.versionProtocolo.findFirst({
    where: { protocoloId },
    orderBy: { numeroVersion: "desc" },
  });

  if (!versionVigente) {
    return fail("Este protocolo todavia no tiene una version publicada");
  }

  // Si el nombre de un paso no cambio, se conserva su descripcion de la
  // version anterior en vez de perderla (el form de edicion solo edita
  // nombres, no descripciones).
  const pasosAnteriores = versionVigente.pasosJson as unknown as Array<{
    nombre: string;
    descripcion?: string;
  }>;
  const descripcionPorNombre = new Map(
    pasosAnteriores.map((p) => [p.nombre, p.descripcion]),
  );

  const nuevoNumeroVersion = versionVigente.numeroVersion + 1;

  await prisma.versionProtocolo.create({
    data: {
      protocoloId,
      numeroVersion: nuevoNumeroVersion,
      pasosJson: pasosLimpios.map((nombre) => {
        const descripcion = descripcionPorNombre.get(nombre);
        return descripcion ? { nombre, descripcion } : { nombre };
      }),
      estadosJson: versionVigente.estadosJson as unknown as string[],
    },
  });

  await registrarEvento({
    entidad: "Protocolo",
    entidadId: protocoloId,
    usuarioId: user.id,
    accion: "nueva_version",
    detalle: { numeroVersion: nuevoNumeroVersion, pasos: pasosLimpios.length },
  });

  const protocolo = await prisma.protocolo.findUnique({ where: { id: protocoloId } });
  if (protocolo) {
    revalidatePath(`/protocolos/${slugify(protocolo.nombre)}`);
  }

  return ok(null);
}
