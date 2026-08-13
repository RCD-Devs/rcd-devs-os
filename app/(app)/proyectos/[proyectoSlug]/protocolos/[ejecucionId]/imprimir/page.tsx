import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { contarProgreso, esEstadoTerminal } from "@/lib/protocolos/estados";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function ImprimirChecklistPage({
  params,
}: {
  params: Promise<{ ejecucionId: string }>;
}) {
  const { ejecucionId } = await params;

  const ejecucion = await prisma.ejecucionProtocolo.findUnique({
    where: { id: ejecucionId },
    include: {
      proyecto: { include: { cliente: true } },
      versionProtocolo: { include: { protocolo: true } },
      pasos: {
        include: {
          responsable: true,
          comentarios: { include: { autor: true }, orderBy: { createdAt: "asc" } },
          evidencias: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!ejecucion) {
    notFound();
  }

  const progreso = contarProgreso(ejecucion.pasos);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-text-muted">Vista imprimible — usa Ctrl/Cmd+P para exportar a PDF.</p>
        <PrintButton />
      </div>

      <h1 className="text-2xl font-bold text-text">{ejecucion.versionProtocolo.protocolo.nombre}</h1>
      <p className="mt-1 text-sm text-text-muted">
        {ejecucion.proyecto.nombre} · {ejecucion.proyecto.cliente.nombre}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Version v{ejecucion.versionProtocolo.numeroVersion} · Estado: {ejecucion.estado} ·{" "}
        {progreso.completos}/{progreso.total} pasos completos · Generado el{" "}
        {new Date().toLocaleDateString("es-CL")}
      </p>

      <ol className="mt-8 space-y-5">
        {ejecucion.pasos.map((paso, i) => (
          <li key={paso.id} className="border-b border-border pb-4 break-inside-avoid">
            <p className="font-medium text-text">
              {i + 1}. {paso.pasoNombre}{" "}
              <span className="font-normal text-text-muted">
                — {paso.estado}
                {esEstadoTerminal(paso.estado) ? "" : " (pendiente)"}
              </span>
            </p>

            {(paso.evidenciaUrl || paso.evidencias.length > 0) && (
              <p className="mt-1 text-sm text-text-muted">
                Evidencia:{" "}
                {[
                  ...(paso.evidenciaUrl ? [paso.evidenciaUrl] : []),
                  ...paso.evidencias.map((e) => e.valor),
                ]
                  .map((valor) =>
                    valor.startsWith("storage:")
                      ? `archivo adjunto (${valor.split("/").pop()})`
                      : valor,
                  )
                  .join(" · ")}
              </p>
            )}
            {paso.notas && <p className="mt-1 text-sm text-text-muted">Notas: {paso.notas}</p>}
            {paso.fechaEjecucion && (
              <p className="mt-1 text-xs text-text-muted">
                Marcado por {paso.responsable?.nombre ?? paso.responsable?.email ?? "?"} el{" "}
                {new Date(paso.fechaEjecucion).toLocaleDateString("es-CL")}
              </p>
            )}

            {paso.comentarios.length > 0 && (
              <ul className="mt-2 space-y-1 pl-4 text-sm text-text-muted">
                {paso.comentarios.map((c) => (
                  <li key={c.id}>
                    — {c.autor.nombre ?? c.autor.email} ({new Date(c.createdAt).toLocaleDateString("es-CL")}
                    ): {c.texto}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
