import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevoProyectoForm } from "./NuevoProyectoForm";
import { ProyectosList } from "./ProyectosList";
import { getEtapas } from "@/lib/catalogos";

export const dynamic = "force-dynamic";

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ archivados?: string }>;
}) {
  const { archivados } = await searchParams;
  const verArchivados = archivados === "1";

  const [proyectos, clientes, etapas] = await Promise.all([
    prisma.proyecto.findMany({
      where: { archivado: verArchivados },
      include: {
        cliente: true,
        etapaActual: true,
        ejecucionesProtocolo: { include: { pasos: true } },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.cliente.findMany({ orderBy: { nombre: "asc" } }),
    getEtapas(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-text">Proyectos</h1>
        <div className="flex rounded-md border border-border p-0.5 text-sm">
          <Link
            href="/proyectos"
            className={`rounded px-3 py-1 ${!verArchivados ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text"}`}
          >
            Activos
          </Link>
          <Link
            href="/proyectos?archivados=1"
            className={`rounded px-3 py-1 ${verArchivados ? "bg-accent text-accent-foreground" : "text-text-muted hover:text-text"}`}
          >
            Archivados
          </Link>
        </div>
      </div>

      {!verArchivados && (
        <Card className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Nuevo proyecto
          </h2>
          <NuevoProyectoForm clientes={clientes} etapas={etapas} />
        </Card>
      )}

      <ProyectosList proyectos={proyectos} />
    </div>
  );
}
