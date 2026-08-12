import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { registrarEvento } from "@/lib/auditoria";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { texto?: string };
  const texto = body.texto?.trim();

  if (!texto) {
    return NextResponse.json({ error: "El comentario no puede estar vacio" }, { status: 400 });
  }

  const paso = await prisma.ejecucionPaso.findUnique({ where: { id }, select: { id: true } });
  if (!paso) {
    return NextResponse.json({ error: "Paso no encontrado" }, { status: 404 });
  }

  const comentario = await prisma.comentario.create({
    data: { ejecucionPasoId: id, autorId: user.id, texto },
    include: { autor: true },
  });

  await registrarEvento({
    entidad: "EjecucionPaso",
    entidadId: id,
    usuarioId: user.id,
    accion: "comentario_agregado",
  });

  return NextResponse.json(comentario, { status: 201 });
}
