import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Catalogos casi estaticos: 8 etapas fijas del roadmap (sin UI para
// agregar/editar, catalogo fijo) y 8 roles sembrados una vez (editables solo
// desde /roles: esAdmin, titular, reemplazo). Cachear evita repetir la misma
// consulta chica en cada request de las paginas force-dynamic que los usan.
//
// Etapas no tiene ninguna mutacion en la app -> cache indefinido (sin
// revalidate). Roles si se edita desde /roles -> se invalida con
// revalidateTag("roles") en esas server actions, no por tiempo.
export const getEtapas = unstable_cache(
  () => prisma.etapa.findMany({ orderBy: { orden: "asc" } }),
  ["catalogo-etapas"],
  { tags: ["etapas"] },
);

export const getRoles = unstable_cache(
  () => prisma.rol.findMany({ orderBy: { nombre: "asc" } }),
  ["catalogo-roles"],
  { tags: ["roles"] },
);
