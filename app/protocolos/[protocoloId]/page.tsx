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
    <main className="flex-1 p-8">
      <h1 className="text-lg font-medium">{protocolo.nombre}</h1>
      <p className="mt-2 text-sm text-neutral-600">{protocolo.objetivo}</p>
      <p className="mt-1 text-sm text-neutral-500">{protocolo.alcance}</p>

      <h2 className="mt-6 text-sm font-medium text-neutral-700">
        Checklist de referencia (v{versionVigente?.numeroVersion ?? "-"})
      </h2>

      {pasos.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">
          Esta version todavia no tiene pasos definidos.
        </p>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {pasos.map((paso, i) => (
            <li key={i}>{paso.nombre}</li>
          ))}
        </ol>
      )}
    </main>
  );
}
