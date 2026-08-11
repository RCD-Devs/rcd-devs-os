import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EtapaSelector } from "./EtapaSelector";
import { IniciarProtocoloButton } from "./IniciarProtocoloButton";

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
        include: { versionProtocolo: { include: { protocolo: true } } },
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
    <main className="flex-1 p-8">
      <h1 className="text-lg font-medium">{proyecto.nombre}</h1>
      <p className="text-sm text-neutral-600">{proyecto.cliente.nombre}</p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-neutral-600">Etapa actual:</span>
        <EtapaSelector
          proyectoId={proyecto.id}
          etapas={etapas}
          etapaActualId={proyecto.etapaActualId}
        />
      </div>

      <h2 className="mt-8 text-sm font-medium text-neutral-700">Protocolos</h2>
      <ul className="mt-2 space-y-3">
        {protocolos.map((protocolo) => {
          const ejecuciones = proyecto.ejecucionesProtocolo.filter(
            (e) => e.versionProtocolo.protocolo.id === protocolo.id,
          );
          const ejecucion =
            ejecuciones.find((e) => e.estado !== "Completo") ?? ejecuciones[0];

          return (
            <li
              key={protocolo.id}
              className="flex items-center justify-between rounded border border-neutral-200 p-4"
            >
              <div>
                <p className="font-medium">{protocolo.nombre}</p>
                {ejecucion && (
                  <p className="text-sm text-neutral-600">Estado: {ejecucion.estado}</p>
                )}
              </div>

              {ejecucion ? (
                <Link
                  href={`/proyectos/${proyecto.id}/protocolos/${ejecucion.id}`}
                  className="text-sm text-neutral-700 underline"
                >
                  Ver checklist
                </Link>
              ) : (
                <IniciarProtocoloButton proyectoId={proyecto.id} protocoloId={protocolo.id} />
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
