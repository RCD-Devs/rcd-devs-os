import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";
import { rateLimit, respuestaLimiteExcedido } from "@/lib/rateLimit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; evidenciaId: string }> },
) {
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

  const { id, evidenciaId } = await params;

  const evidencia = await prisma.evidenciaPaso.findUnique({ where: { id: evidenciaId } });
  if (!evidencia || evidencia.ejecucionPasoId !== id) {
    return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
  }

  await prisma.evidenciaPaso.delete({ where: { id: evidenciaId } });

  await registrarEvento({
    entidad: "EjecucionPaso",
    entidadId: id,
    usuarioId: user.id,
    accion: "evidencia_quitada",
  });

  return new NextResponse(null, { status: 204 });
}
