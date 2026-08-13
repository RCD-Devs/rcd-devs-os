import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevaSolicitudForm } from "./NuevaSolicitudForm";
import { SolicitudRow } from "./SolicitudRow";
import { getRoles } from "@/lib/catalogos";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function SolicitudesPage() {
  const [solicitudes, proyectos, roles] = await Promise.all([
    prisma.solicitud.findMany({
      include: { proyecto: true, responsableRol: true, solicitante: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.proyecto.findMany({ where: { archivado: false }, orderBy: { nombre: "asc" } }),
    getRoles(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Solicitudes</h1>
      <p className="mt-2 text-sm text-text-muted">
        Flujo interno de solicitudes: formulario → asignación a un rol → seguimiento de estado.
        Sin integración a JIRA.
      </p>

      <Card className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Nueva solicitud
        </h2>
        <NuevaSolicitudForm proyectos={proyectos} roles={roles} />
      </Card>

      {solicitudes.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay solicitudes.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {solicitudes.map((solicitud) => (
            <li key={solicitud.id}>
              <SolicitudRow solicitud={solicitud} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
