import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EjecucionPasoRow } from "./EjecucionPasoRow";
import { EstadoBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { contarProgreso } from "@/lib/protocolos/estados";

export default async function ChecklistEjecucionPage({
  params,
}: {
  params: Promise<{ proyectoId: string; ejecucionId: string }>;
}) {
  const { ejecucionId } = await params;

  const ejecucion = await prisma.ejecucionProtocolo.findUnique({
    where: { id: ejecucionId },
    include: {
      versionProtocolo: { include: { protocolo: true } },
      pasos: { include: { responsable: true } },
    },
  });

  if (!ejecucion) {
    notFound();
  }

  const estadosValidos = ejecucion.versionProtocolo.estadosJson as unknown as string[];
  const progreso = contarProgreso(ejecucion.pasos);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">
        {ejecucion.versionProtocolo.protocolo.nombre}
      </h1>
      <div className="mt-2 flex items-center gap-3">
        <EstadoBadge estado={ejecucion.estado} />
        <ProgressBar value={progreso.completos} max={progreso.total} />
      </div>

      <ul className="mt-6 space-y-3">
        {ejecucion.pasos.map((paso) => (
          <EjecucionPasoRow key={paso.id} paso={paso} estadosValidos={estadosValidos} />
        ))}
      </ul>
    </div>
  );
}
