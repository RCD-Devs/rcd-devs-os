import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevoProyectoForm } from "./NuevoProyectoForm";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const [proyectos, clientes, etapas] = await Promise.all([
    prisma.proyecto.findMany({
      include: { cliente: true, etapaActual: true },
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

      {proyectos.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay proyectos.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {proyectos.map((proyecto) => (
            <li key={proyecto.id}>
              <Link href={`/proyectos/${proyecto.id}`}>
                <Card className="flex items-center justify-between transition-colors hover:border-accent">
                  <div>
                    <p className="font-medium">{proyecto.nombre}</p>
                    <p className="text-sm text-text-muted">{proyecto.cliente.nombre}</p>
                  </div>
                  <span className="text-sm text-text-muted">{proyecto.etapaActual.nombre}</span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
