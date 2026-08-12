import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { EstadoBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { slugConId, slugify } from "@/lib/slug";
import { TONE_BG_TEXT, toneFromString } from "@/lib/ui/tone";

export default async function ProtocoloDetallePage({
  params,
}: {
  params: Promise<{ protocoloSlug: string }>;
}) {
  const { protocoloSlug } = await params;

  // El protocolo se busca por nombre (unico en el schema), no por id: el
  // slug de la URL se genera desde el nombre y no existe una columna
  // dedicada, asi que la resolucion pasa por listar y comparar en memoria.
  const candidatos = await prisma.protocolo.findMany({ select: { id: true, nombre: true } });
  const protocoloId = candidatos.find((p) => slugify(p.nombre) === protocoloSlug)?.id;

  if (!protocoloId) {
    notFound();
  }

  const [protocolo, ejecuciones] = await Promise.all([
    prisma.protocolo.findUnique({
      where: { id: protocoloId },
      include: {
        versiones: { orderBy: { numeroVersion: "desc" } },
      },
    }),
    prisma.ejecucionProtocolo.findMany({
      where: { versionProtocolo: { protocoloId } },
      include: { proyecto: { include: { cliente: true } } },
    }),
  ]);

  if (!protocolo) {
    notFound();
  }

  const [versionVigente, ...versionesAnteriores] = protocolo.versiones;
  const pasos =
    (versionVigente?.pasosJson as unknown as Array<{ nombre: string; descripcion?: string }>) ??
    [];
  const estadosValidos = (versionVigente?.estadosJson as unknown as string[]) ?? [];

  const proyectosUnicos = new Map(ejecuciones.map((e) => [e.proyecto.id, e.proyecto]));
  const tone = toneFromString(protocolo.id);

  return (
    <div>
      <Link
        href="/protocolos"
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Protocolos
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">{protocolo.nombre}</h1>
      <p className="mt-2 text-sm text-text-muted">{protocolo.objetivo}</p>
      <p className="mt-1 text-sm text-text-muted">{protocolo.alcance}</p>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
          <span className="font-mono">v{versionVigente?.numeroVersion ?? "-"}</span>
          <span>{pasos.length} pasos</span>
          <span>
            {ejecuciones.length} ejecucion{ejecuciones.length === 1 ? "" : "es"}
          </span>
          <span>
            usado en {proyectosUnicos.size} proyecto{proyectosUnicos.size === 1 ? "" : "s"}
          </span>
        </div>

        {estadosValidos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {estadosValidos.map((estado) => (
              <EstadoBadge key={estado} estado={estado} />
            ))}
          </div>
        )}
      </Card>

      {proyectosUnicos.size > 0 && (
        <>
          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Proyectos que lo usan
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {[...proyectosUnicos.values()].map((proyecto) => (
              <li key={proyecto.id}>
                <Link
                  href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1.5 text-sm hover:border-accent"
                >
                  <Avatar nombre={proyecto.cliente.nombre} size={22} />
                  {proyecto.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Checklist de referencia (v{versionVigente?.numeroVersion ?? "-"})
        </h2>
        {versionVigente && (
          <Link
            href={`/protocolos/${protocoloSlug}/editar`}
            className="flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <Pencil size={12} strokeWidth={2} />
            Editar
          </Link>
        )}
      </div>

      {pasos.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          Esta version todavia no tiene pasos definidos.
        </p>
      ) : (
        <ol className="mt-4">
          {pasos.map((paso, i) => {
            return (
              <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
                {i < pasos.length - 1 && (
                  <span className="absolute top-8 bottom-0 left-4 w-px bg-border" />
                )}
                <span
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${TONE_BG_TEXT[tone]}`}
                >
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <p className="text-sm font-medium text-text">{paso.nombre}</p>
                  {paso.descripcion && (
                    <p className="mt-0.5 text-sm text-text-muted">{paso.descripcion}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {versionesAnteriores.length > 0 && (
        <details className="mt-8 rounded-lg border border-border bg-surface p-4">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-text-muted">
            Versiones anteriores ({versionesAnteriores.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {versionesAnteriores.map((version) => {
              const pasosVersion = (version.pasosJson as unknown as unknown[]) ?? [];
              return (
                <li
                  key={version.id}
                  className="flex items-center justify-between gap-3 text-sm text-text-muted"
                >
                  <span className="font-mono">v{version.numeroVersion}</span>
                  <span>{pasosVersion.length} pasos</span>
                  <span className="font-mono text-xs">
                    {new Date(version.fechaPublicacion).toLocaleDateString("es-CL")}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
