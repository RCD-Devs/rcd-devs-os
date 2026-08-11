import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { calcularEstadoEjecucion, esEstadoTerminal, esEstadoValido } from "@/lib/protocolos/estados";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    estado?: string;
    notas?: string | null;
    evidenciaUrl?: string | null;
  };
  const { estado, notas, evidenciaUrl } = body;

  const paso = await prisma.ejecucionPaso.findUnique({
    where: { id },
    include: { ejecucion: { include: { versionProtocolo: true } } },
  });

  if (!paso) {
    return NextResponse.json({ error: "Paso no encontrado" }, { status: 404 });
  }

  const estadosValidos = paso.ejecucion.versionProtocolo.estadosJson as unknown as string[];

  if (estado !== undefined && !esEstadoValido(estadosValidos, estado)) {
    return NextResponse.json(
      { error: `Estado invalido. Estados validos: ${estadosValidos.join(", ")}` },
      { status: 400 },
    );
  }

  const nuevoEstado = estado ?? paso.estado;

  const pasoActualizado = await prisma.ejecucionPaso.update({
    where: { id },
    data: {
      estado: nuevoEstado,
      notas: notas === undefined ? undefined : notas,
      evidenciaUrl: evidenciaUrl === undefined ? undefined : evidenciaUrl,
      fechaEjecucion: esEstadoTerminal(nuevoEstado) ? new Date() : null,
      responsableId: user.id,
    },
  });

  const pasosEjecucion = await prisma.ejecucionPaso.findMany({
    where: { ejecucionId: paso.ejecucionId },
  });

  await prisma.ejecucionProtocolo.update({
    where: { id: paso.ejecucionId },
    data: { estado: calcularEstadoEjecucion(pasosEjecucion) },
  });

  return NextResponse.json(pasoActualizado);
}
