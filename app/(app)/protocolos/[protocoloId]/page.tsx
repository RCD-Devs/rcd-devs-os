import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProtocoloDetallePage({
  params,
}: {
  params: Promise<{ protocoloId: string }>;
}) {
  const { protocoloId } = await params;

  const protocolo = await prisma.protocolo.findUnique({
    where: { id: protocoloId },
    include: {
      versiones: { orderBy: { numeroVersion: "desc" }, take: 1 },
    },
  });

  if (!protocolo) {
    notFound();
  }

  const versionVigente = protocolo.versiones[0];
  const pasos = (versionVigente?.pasosJson as unknown as Array<{ nombre: string }>) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">{protocolo.nombre}</h1>
      <p className="mt-2 text-sm text-text-muted">{protocolo.objetivo}</p>
      <p className="mt-1 text-sm text-text-muted">{protocolo.alcance}</p>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Checklist de referencia (v{versionVigente?.numeroVersion ?? "-"})
      </h2>

      {pasos.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          Esta version todavia no tiene pasos definidos.
        </p>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {pasos.map((paso, i) => (
            <li key={i}>{paso.nombre}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
