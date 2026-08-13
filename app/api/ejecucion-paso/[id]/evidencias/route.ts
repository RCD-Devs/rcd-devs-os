import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { rateLimit, respuestaLimiteExcedido } from "@/lib/rateLimit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limite = rateLimit(`ejecucion-paso-evidencia:${user.id}`, 30, 60_000);
  if (!limite.permitido) {
    return respuestaLimiteExcedido(limite.reintentarEnMs);
  }

  const { id } = await params;
  const body = (await request.json()) as { valor?: string };
  const valor = body.valor?.trim();

  if (!valor) {
    return NextResponse.json({ error: "El adjunto no puede estar vacio" }, { status: 400 });
  }

  const paso = await prisma.ejecucionPaso.findUnique({ where: { id }, select: { id: true } });
  if (!paso) {
    return NextResponse.json({ error: "Paso no encontrado" }, { status: 404 });
  }

  const evidencia = await prisma.evidenciaPaso.create({
    data: { ejecucionPasoId: id, valor, creadoPorId: user.id },
    include: { creadoPor: true },
  });

  await registrarEvento({
    entidad: "EjecucionPaso",
    entidadId: id,
    usuarioId: user.id,
    accion: "evidencia_agregada",
  });

  return NextResponse.json(evidencia, { status: 201 });
}
