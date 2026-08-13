import Link from "next/link";
import { CircleCheckBig, ChevronLeft, FolderKanban, ListChecks, Percent } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EtapaBadge } from "@/components/ui/EtapaBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { EditarClienteForm } from "./EditarClienteForm";
import { EliminarClienteButton } from "./EliminarClienteButton";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { contarProgreso } from "@/lib/protocolos/estados";
import { slugConId } from "@/lib/slug";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const [cliente, usuario] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        proyectos: {
          include: { etapaActual: true, ejecucionesProtocolo: { include: { pasos: true } } },
          orderBy: { nombre: "asc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!cliente) {
    notFound();
  }

  // Cumplimiento agregado del cliente: no es el promedio de los % de cada
  // proyecto (eso pesa igual un proyecto de 2 pasos que uno de 40), es la
  // suma de pasos completos sobre la suma de pasos totales de todos sus
  // proyectos — asi un proyecto grande pesa lo que corresponde.
  const proyectosConProgreso = cliente.proyectos.map((proyecto) => ({
    proyecto,
    progreso: contarProgreso(proyecto.ejecucionesProtocolo.flatMap((e) => e.pasos)),
  }));
  const totalPasos = proyectosConProgreso.reduce((acc, p) => acc + p.progreso.total, 0);
  const pasosCompletos = proyectosConProgreso.reduce((acc, p) => acc + p.progreso.completos, 0);
  const pctCumplimiento = totalPasos === 0 ? 0 : Math.round((pasosCompletos / totalPasos) * 100);

  const todasLasEjecuciones = cliente.proyectos.flatMap((p) => p.ejecucionesProtocolo);
  const protocolosCompletos = todasLasEjecuciones.filter((e) => e.estado === "Completo").length;
  const protocolosEnCurso = todasLasEjecuciones.filter((e) => e.estado !== "Completo").length;

  return (
    <div>
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Clientes
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">{cliente.nombre}</h1>

      <Card className="mt-6 max-w-2xl">
        <EditarClienteForm cliente={cliente} />
      </Card>

      {cliente.proyectos.length > 0 && (
        <>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Cumplimiento
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Proyectos" value={cliente.proyectos.length} icon={FolderKanban} tone={1} />
            <StatCard
              label="Protocolos completos"
              value={protocolosCompletos}
              icon={CircleCheckBig}
              tone={2}
            />
            <StatCard label="Protocolos en curso" value={protocolosEnCurso} icon={ListChecks} tone={4} />
            <StatCard label="% pasos completos" value={pctCumplimiento} icon={Percent} tone={3} />
          </div>
        </>
      )}

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Proyectos ({cliente.proyectos.length})
      </h2>
      {proyectosConProgreso.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">Todavia no tiene proyectos.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {proyectosConProgreso.map(({ proyecto, progreso }) => (
            <li key={proyecto.id}>
              <Link href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}>
                <Card className="flex flex-wrap items-center justify-between gap-3 transition-colors hover:border-accent">
                  <span className="flex items-center gap-2 font-medium">
                    <FolderKanban size={14} strokeWidth={2} className="text-text-muted" />
                    {proyecto.nombre}
                  </span>
                  <div className="flex items-center gap-3">
                    {progreso.total > 0 ? (
                      <ProgressBar value={progreso.completos} max={progreso.total} />
                    ) : (
                      <span className="font-mono text-xs text-text-muted">sin protocolos</span>
                    )}
                    <EtapaBadge
                      nombre={proyecto.etapaActual.nombre}
                      orden={proyecto.etapaActual.orden}
                    />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {esAdmin(usuario) && (
        <div className="mt-10 border-t border-border pt-6">
          <EliminarClienteButton clienteId={cliente.id} />
        </div>
      )}
    </div>
  );
}
