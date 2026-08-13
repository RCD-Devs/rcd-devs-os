import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, Bell, Clock, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { calcularSemaforo, SEMAFORO_LABEL } from "@/lib/proyectos/semaforo";
import { slugConId } from "@/lib/slug";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

const MS_DIA = 86400000;

function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / MS_DIA);
}

function FallbackSeccion() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-3">
          <Skeleton className="size-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Cada seccion hace su propia consulta y se streamea independiente (ver
// <Suspense> abajo): antes la pagina esperaba ambas consultas (proyectos +
// solicitudes) antes de mostrar cualquier cosa, ahora el layout aparece de
// inmediato y cada seccion llega quede lista.
async function ProyectosEnRiesgoSection() {
  const proyectos = await prisma.proyecto.findMany({
    where: { archivado: false },
    include: {
      cliente: true,
      ejecucionesProtocolo: { select: { estado: true, fechaLimite: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const proyectosEnRiesgo = proyectos
    .map((p) => ({ proyecto: p, semaforo: calcularSemaforo(p) }))
    .filter((p) => p.semaforo !== "verde");

  if (proyectosEnRiesgo.length === 0) {
    return (
      <p className="text-sm text-text-muted">Ningun proyecto en riesgo por ahora.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {proyectosEnRiesgo.map(({ proyecto, semaforo }) => (
        <li key={proyecto.id}>
          <Link href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}>
            <Card className="flex items-center justify-between gap-3 transition-colors hover:border-accent">
              <div className="flex items-center gap-2.5">
                <SemaforoDot semaforo={semaforo} />
                <div>
                  <p className="font-medium">{proyecto.nombre}</p>
                  <p className="text-sm text-text-muted">{proyecto.cliente.nombre}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-text-muted">{SEMAFORO_LABEL[semaforo]}</span>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function SolicitudesEnRiesgoSection() {
  const solicitudes = await prisma.solicitud.findMany({
    where: { estado: { notIn: ["Resuelta", "Rechazada"] }, slaFechaLimite: { not: null } },
    include: { proyecto: true, responsableRol: true },
    orderBy: { slaFechaLimite: "asc" },
  });

  const solicitudesEnRiesgo = solicitudes
    .filter((s) => s.slaFechaLimite && diasHasta(s.slaFechaLimite) <= 7)
    .map((s) => ({ solicitud: s, dias: diasHasta(s.slaFechaLimite!) }));

  if (solicitudesEnRiesgo.length === 0) {
    return <p className="text-sm text-text-muted">Ninguna solicitud por vencer.</p>;
  }

  return (
    <ul className="space-y-2">
      {solicitudesEnRiesgo.map(({ solicitud, dias }) => (
        <li key={solicitud.id}>
          <Link href="/solicitudes">
            <Card className="flex items-center justify-between gap-3 transition-colors hover:border-accent">
              <div className="flex items-center gap-2.5">
                <Inbox size={16} strokeWidth={2} className="shrink-0 text-text-muted" />
                <div>
                  <p className="font-medium">{solicitud.tipo}</p>
                  <p className="text-sm text-text-muted">
                    {solicitud.proyecto.nombre} · {solicitud.responsableRol.nombre}
                  </p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-text-muted">
                {dias < 0 ? (
                  <AlertTriangle size={12} strokeWidth={2} className="text-chart-5" />
                ) : (
                  <Clock size={12} strokeWidth={2} className="text-warning" />
                )}
                {dias < 0
                  ? `Vencida hace ${Math.abs(dias)}d`
                  : dias === 0
                    ? "Vence hoy"
                    : `Vence en ${dias}d`}
              </span>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function AlertasPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Alertas</h1>
      <p className="mt-2 text-sm text-text-muted">
        Todo lo que necesita atencion, en un solo lugar: proyectos con plazos en riesgo y
        solicitudes por vencer.
      </p>

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <Bell size={13} strokeWidth={2} />
            Proyectos
          </h2>
          <div className="mt-3">
            <Suspense fallback={<FallbackSeccion />}>
              <ProyectosEnRiesgoSection />
            </Suspense>
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <Inbox size={13} strokeWidth={2} />
            Solicitudes
          </h2>
          <div className="mt-3">
            <Suspense fallback={<FallbackSeccion />}>
              <SolicitudesEnRiesgoSection />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
