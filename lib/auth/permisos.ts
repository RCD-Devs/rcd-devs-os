import { prisma } from "@/lib/prisma";
import { esAdmin } from "@/lib/auth/esAdmin";

type UsuarioConRol = {
  rolId: string | null;
  rol: { esAdmin: boolean } | null;
} | null;

// RolPermiso es una lista de EXCEPCIONES (ver comentario en schema.prisma):
// por defecto todo rol no-admin puede crear: solo se bloquea si existe una
// fila explicita para ese rol+recurso. Los admin nunca se filtran contra
// esta tabla. Un usuario sin rol asignado tampoco se restringe (mismo
// comportamiento que tenia la app antes de este sistema de permisos).
export async function puedeCrear(usuario: UsuarioConRol, recurso: string): Promise<boolean> {
  if (esAdmin(usuario)) {
    return true;
  }
  if (!usuario?.rolId) {
    return true;
  }

  const bloqueo = await prisma.rolPermiso.findUnique({
    where: {
      rolId_recurso_accion: { rolId: usuario.rolId, recurso, accion: "crear" },
    },
  });

  return !bloqueo;
}
