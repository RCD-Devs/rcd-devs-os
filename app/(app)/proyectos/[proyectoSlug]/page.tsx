import Link from "next/link";
import { ChevronLeft, History } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EtapaSelector } from "./EtapaSelector";
import { IniciarProtocoloButton } from "./IniciarProtocoloButton";
import { EliminarProyectoButton } from "./EliminarProyectoButton";
import { ArchivarProyectoButton } from "./ArchivarProyectoButton";
import { Card } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { contarProgreso } from "@/lib/protocolos/estados";
import { calcularSemaforo, SEMAFORO_LABEL } from "@/lib/proyectos/semaforo";
import { slugConId } from "@/lib/slug";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { getEtapas } from "@/lib/catalogos";

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ proyectoSlug: string }>;
}) {
  const { proyectoSlug } = await params;

  // El nombre de Proyecto no es unico (a diferencia de Protocolo), asi que el
  // slug lleva un sufijo de id: se resuelve comparando contra todos los
  // proyectos en vez de una columna dedicada.
  const candidatos = await prisma.proyecto.findMany({ select: { id: true, nombre: true } });
  const proyectoId = candidatos.find((p) => slugConId(p.nombre, p.id) === proyectoSlug)?.id;

  if (!proyectoId) {
    notFound();
  }

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

  const [etapas, protocolos, usuario] = await Promise.all([
    getEtapas(),
    prisma.protocolo.findMany({ orderBy: { nombre: "asc" } }),
    getCurrentUser(),
  ]);

  const semaforo = calcularSemaforo(proyecto);

  return (
    <div>
      <Link
        href="/proyectos"
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Proyectos
      </Link>

      <div className="mt-2 flex items-center gap-2">
        <SemaforoDot semaforo={semaforo} />
        <h1 className="text-2xl font-bold tracking-tight text-text">{proyecto.nombre}</h1>
        <span className="text-xs text-text-muted">{SEMAFORO_LABEL[semaforo]}</span>
        {proyecto.archivado && (
          <span className="rounded-full bg-neutral-badge-bg px-2 py-0.5 text-xs font-medium text-neutral-badge">
            Archivado
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-text-muted">{proyecto.cliente.nombre}</p>
        <Link
          href={`/proyectos/${proyectoSlug}/timeline`}
          className="flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <History size={12} strokeWidth={2} />
          Timeline
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-text-muted">Etapa actual:</span>
        <EtapaSelector
          proyectoId={proyecto.id}
          proyectoSlug={proyectoSlug}
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
                    href={`/proyectos/${proyectoSlug}/protocolos/${ejecucion.id}`}
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

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <ArchivarProyectoButton
          proyectoId={proyecto.id}
          proyectoSlug={proyectoSlug}
          archivado={proyecto.archivado}
        />
        {esAdmin(usuario) && <EliminarProyectoButton proyectoId={proyecto.id} />}
      </div>
    </div>
  );
}
