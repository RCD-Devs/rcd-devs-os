import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EtapaSelector } from "./EtapaSelector";
import { IniciarProtocoloButton } from "./IniciarProtocoloButton";
import { Card } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { contarProgreso } from "@/lib/protocolos/estados";

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ proyectoId: string }>;
}) {
  const { proyectoId } = await params;

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: proyectoId },
    include: {
      cliente: true,
      etapaActual: true,
      ejecucionesProtocolo: {
        include: { versionProtocolo: { include: { protocolo: true } }, pasos: true },
      },
    },
  });

  if (!proyecto) {
    notFound();
  }

  const [etapas, protocolos] = await Promise.all([
    prisma.etapa.findMany({ orderBy: { orden: "asc" } }),
    prisma.protocolo.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">{proyecto.nombre}</h1>
      <p className="text-sm text-text-muted">{proyecto.cliente.nombre}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-text-muted">Etapa actual:</span>
        <EtapaSelector
          proyectoId={proyecto.id}
          etapas={etapas}
          etapaActualId={proyecto.etapaActualId}
        />
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Protocolos
      </h2>
      <ul className="mt-2 space-y-3">
        {protocolos.map((protocolo) => {
          const ejecuciones = proyecto.ejecucionesProtocolo.filter(
            (e) => e.versionProtocolo.protocolo.id === protocolo.id,
          );
          const ejecucion =
            ejecuciones.find((e) => e.estado !== "Completo") ?? ejecuciones[0];
          const progreso = ejecucion ? contarProgreso(ejecucion.pasos) : null;

          return (
            <li key={protocolo.id}>
              <Card className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{protocolo.nombre}</p>
                  {ejecucion && progreso && (
                    <div className="mt-1 flex items-center gap-3">
                      <EstadoBadge estado={ejecucion.estado} />
                      <ProgressBar value={progreso.completos} max={progreso.total} />
                    </div>
                  )}
                </div>

                {ejecucion ? (
                  <Link
                    href={`/proyectos/${proyecto.id}/protocolos/${ejecucion.id}`}
                    className="text-sm text-accent underline"
                  >
                    Ver checklist
                  </Link>
                ) : (
                  <IniciarProtocoloButton proyectoId={proyecto.id} protocoloId={protocolo.id} />
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
