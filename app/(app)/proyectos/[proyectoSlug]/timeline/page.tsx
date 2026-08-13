import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEtapas } from "@/lib/catalogos";
import { slugConId } from "@/lib/slug";

// Vista dedicada de cambios de etapa a lo largo del tiempo (#14 de
// MEJORAS-PROPUESTAS.md): ese historial ya vivia en EventoAuditoria, pero
// sin una vista que lo agrupara por proyecto.
export const dynamic = "force-dynamic";

const ETIQUETA_ACCION: Record<string, string> = {
  creado: "Proyecto creado",
  cambio_etapa: "Cambio de etapa",
  archivado: "Proyecto archivado",
  desarchivado: "Proyecto desarchivado",
};

export default async function TimelineProyectoPage({
  params,
}: {
  params: Promise<{ proyectoSlug: string }>;
}) {
  const { proyectoSlug } = await params;

  // El slug lleva un sufijo de id (Proyecto.nombre no es unico): se resuelve
  // igual que en el resto de las rutas de /proyectos/[proyectoSlug].
  const candidatos = await prisma.proyecto.findMany({ select: { id: true, nombre: true } });
  const proyectoId = candidatos.find((p) => slugConId(p.nombre, p.id) === proyectoSlug)?.id;

  if (!proyectoId) {
    notFound();
  }

  const [proyecto, eventos, etapas] = await Promise.all([
    prisma.proyecto.findUnique({ where: { id: proyectoId } }),
    prisma.eventoAuditoria.findMany({
      where: { entidad: "Proyecto", entidadId: proyectoId },
      include: { usuario: true },
      orderBy: { createdAt: "desc" },
    }),
    getEtapas(),
  ]);

  if (!proyecto) {
    notFound();
  }

  const nombrePorEtapaId = new Map(etapas.map((e) => [e.id, e.nombre]));

  function descripcion(evento: (typeof eventos)[number]): string {
    if (evento.accion === "cambio_etapa") {
      const detalle = evento.detalle as { etapaAnteriorId?: string; etapaNuevaId?: string } | null;
      const anterior = detalle?.etapaAnteriorId
        ? (nombrePorEtapaId.get(detalle.etapaAnteriorId) ?? "?")
        : null;
      const nueva = detalle?.etapaNuevaId ? (nombrePorEtapaId.get(detalle.etapaNuevaId) ?? "?") : "?";
      return anterior ? `${anterior} → ${nueva}` : `→ ${nueva}`;
    }
    return ETIQUETA_ACCION[evento.accion] ?? evento.accion;
  }

  return (
    <div>
      <Link
        href={`/proyectos/${proyectoSlug}`}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        {proyecto.nombre}
      </Link>

      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-text">
        <History size={22} strokeWidth={2} className="text-text-muted" />
        Timeline
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Historial de cambios de etapa y otros hitos de {proyecto.nombre}.
      </p>

      {eventos.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay eventos registrados.</p>
      ) : (
        <ol className="mt-8">
          {eventos.map((evento, i) => (
            <li key={evento.id} className="relative flex gap-3 pb-6 last:pb-0">
              {i < eventos.length - 1 && (
                <span className="absolute top-8 bottom-0 left-4 w-px bg-border" />
              )}
              <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <History size={14} strokeWidth={2} />
              </span>
              <div className="pt-1.5">
                <p className="text-sm font-medium text-text">{descripcion(evento)}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {evento.usuario?.nombre ?? evento.usuario?.email ?? "sistema"} ·{" "}
                  {evento.createdAt.toLocaleString("es-CL")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
