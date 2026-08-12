import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevoProyectoForm } from "./NuevoProyectoForm";
import { ProyectosList } from "./ProyectosList";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const [proyectos, clientes, etapas] = await Promise.all([
    prisma.proyecto.findMany({
      include: {
        cliente: true,
        etapaActual: true,
        ejecucionesProtocolo: { include: { pasos: true } },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.cliente.findMany({ orderBy: { nombre: "asc" } }),
    prisma.etapa.findMany({ orderBy: { orden: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Proyectos</h1>

      <Card className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Nuevo proyecto
        </h2>
        <NuevoProyectoForm clientes={clientes} etapas={etapas} />
      </Card>

      <ProyectosList proyectos={proyectos} />
    </div>
  );
}
