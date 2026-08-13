import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EjecucionPasoRow } from "./EjecucionPasoRow";
import { Card } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { contarProgreso } from "@/lib/protocolos/estados";

export default async function ChecklistEjecucionPage({
  params,
}: {
  params: Promise<{ proyectoSlug: string; ejecucionId: string }>;
}) {
  const { proyectoSlug, ejecucionId } = await params;

  const ejecucion = await prisma.ejecucionProtocolo.findUnique({
    where: { id: ejecucionId },
    include: {
      proyecto: true,
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

  const estadosValidos = ejecucion.versionProtocolo.estadosJson as unknown as string[];
  const progreso = contarProgreso(ejecucion.pasos);
  const pct = progreso.total === 0 ? 0 : Math.round((progreso.completos / progreso.total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/proyectos/${proyectoSlug}`}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          {ejecucion.proyecto.nombre}
        </Link>
        <Link
          href={`/proyectos/${proyectoSlug}/protocolos/${ejecucionId}/imprimir`}
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent"
        >
          <Printer size={15} strokeWidth={2} />
          Exportar a PDF
        </Link>
      </div>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">
        {ejecucion.versionProtocolo.protocolo.nombre}
      </h1>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <EstadoBadge estado={ejecucion.estado} />
          <span className="font-mono text-xs text-text-muted">
            v{ejecucion.versionProtocolo.numeroVersion}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold tabular-nums text-text">
            {progreso.completos}
            <span className="text-text-muted">/{progreso.total}</span>
          </p>
          <div className="h-2.5 w-40 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-success transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 font-mono text-sm text-text-muted">{pct}%</span>
        </div>
      </Card>

      <ul className="mt-6 space-y-3">
        {ejecucion.pasos.map((paso) => (
          <EjecucionPasoRow key={paso.id} paso={paso} estadosValidos={estadosValidos} />
        ))}
      </ul>
    </div>
  );
}
