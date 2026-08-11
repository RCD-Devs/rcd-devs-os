import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { Prisma } from "@/app/generated/prisma/client";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    proyectoId?: string;
    protocoloId?: string;
  };
  const { proyectoId, protocoloId } = body;

  if (!proyectoId || !protocoloId) {
    return NextResponse.json(
      { error: "proyectoId y protocoloId son requeridos" },
      { status: 400 },
    );
  }

  const versionVigente = await prisma.versionProtocolo.findFirst({
    where: { protocoloId },
    orderBy: { numeroVersion: "desc" },
  });

  if (!versionVigente) {
    return NextResponse.json(
      { error: "No existe una version publicada de este protocolo" },
      { status: 400 },
    );
  }

  const pasosPlantilla = versionVigente.pasosJson as unknown as Array<{ nombre: string }>;

  if (pasosPlantilla.length === 0) {
    return NextResponse.json(
      { error: "Este protocolo todavia no tiene pasos definidos" },
      { status: 400 },
    );
  }

  const ejecucionActiva = await prisma.ejecucionProtocolo.findFirst({
    where: {
      proyectoId,
      versionProtocolo: { protocoloId },
      estado: { not: "Completo" },
    },
  });

  if (ejecucionActiva) {
    return NextResponse.json(
      { error: "Ya existe una ejecucion activa de este protocolo en el proyecto" },
      { status: 400 },
    );
  }

  const estadosValidos = versionVigente.estadosJson as unknown as string[];
  const estadoInicial = estadosValidos[0];

  const pasosCreate: Prisma.EjecucionPasoCreateWithoutEjecucionInput[] = pasosPlantilla.map(
    (paso) => ({
      pasoNombre: paso.nombre,
      estado: estadoInicial,
    }),
  );

  const ejecucion = await prisma.ejecucionProtocolo.create({
    data: {
      proyectoId,
      versionProtocoloId: versionVigente.id,
      estado: "En curso",
      pasos: { create: pasosCreate },
    },
    include: { pasos: true },
  });

  return NextResponse.json(ejecucion, { status: 201 });
}
