import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return prisma.usuario.findUnique({
    where: { id: user.id },
    include: { rol: true },
  });
}
