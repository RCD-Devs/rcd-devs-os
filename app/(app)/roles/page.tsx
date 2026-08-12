import { prisma } from "@/lib/prisma";
import { RolRow } from "./RolRow";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const [roles, usuarios] = await Promise.all([
    prisma.rol.findMany({ orderBy: { nombre: "asc" } }),
    prisma.usuario.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Roles</h1>
      <p className="mt-2 text-sm text-text-muted">
        Cada responsabilidad se asigna a un rol, no a una persona: define titular y reemplazo por
        rol.
      </p>

      {roles.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay roles.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {roles.map((rol) => (
            <li key={rol.id}>
              <RolRow rol={rol} usuarios={usuarios} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
