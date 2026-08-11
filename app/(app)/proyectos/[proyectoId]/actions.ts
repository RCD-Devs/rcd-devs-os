"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function actualizarEtapaProyecto(proyectoId: string, etapaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  await prisma.proyecto.update({
    where: { id: proyectoId },
    data: { etapaActualId: etapaId },
  });

  revalidatePath(`/proyectos/${proyectoId}`);
}
