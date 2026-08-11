import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EjecucionPasoRow } from "./EjecucionPasoRow";
import { EstadoBadge } from "@/components/ui/Badge";

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
      pasos: true,
    },
  });

  if (!ejecucion) {
    notFound();
  }

  const estadosValidos = ejecucion.versionProtocolo.estadosJson as unknown as string[];

  return (
    <div>
      <h1 className="text-lg font-medium">{ejecucion.versionProtocolo.protocolo.nombre}</h1>
      <div className="mt-2">
        <EstadoBadge estado={ejecucion.estado} />
      </div>

      <ul className="mt-6 space-y-3">
        {ejecucion.pasos.map((paso) => (
          <EjecucionPasoRow key={paso.id} paso={paso} estadosValidos={estadosValidos} />
        ))}
      </ul>
    </div>
  );
}
