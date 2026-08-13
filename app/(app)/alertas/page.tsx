import Link from "next/link";
import { AlertTriangle, Bell, Clock, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { SemaforoDot } from "@/components/ui/SemaforoDot";
import { calcularSemaforo, SEMAFORO_LABEL } from "@/lib/proyectos/semaforo";
import { slugConId } from "@/lib/slug";

// Sustituto de notificaciones Slack/correo (roadmap fase 2): sin credenciales
// de un canal externo no hay como enviar notificaciones reales todavia, asi
// que esta vista centraliza "lo que necesita atencion" dentro de la app.
export const dynamic = "force-dynamic";

const MS_DIA = 86400000;

function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((fecha.getTime() - hoy.getTime()) / MS_DIA);
}

export default async function AlertasPage() {
  const [proyectos, solicitudes] = await Promise.all([
    prisma.proyecto.findMany({
      where: { archivado: false },
      include: {
        cliente: true,
        ejecucionesProtocolo: { select: { estado: true, fechaLimite: true } },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.solicitud.findMany({
      where: { estado: { notIn: ["Resuelta", "Rechazada"] }, slaFechaLimite: { not: null } },
      include: { proyecto: true, responsableRol: true },
      orderBy: { slaFechaLimite: "asc" },
    }),
  ]);

  const proyectosEnRiesgo = proyectos
    .map((p) => ({ proyecto: p, semaforo: calcularSemaforo(p) }))
    .filter((p) => p.semaforo !== "verde");

  const solicitudesEnRiesgo = solicitudes
    .filter((s) => s.slaFechaLimite && diasHasta(s.slaFechaLimite) <= 7)
    .map((s) => ({ solicitud: s, dias: diasHasta(s.slaFechaLimite!) }));

  const sinAlertas = proyectosEnRiesgo.length === 0 && solicitudesEnRiesgo.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Alertas</h1>
      <p className="mt-2 text-sm text-text-muted">
        Todo lo que necesita atencion, en un solo lugar: proyectos con plazos en riesgo y
        solicitudes por vencer.
      </p>

      {sinAlertas ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Bell size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-sm text-text-muted">Sin alertas activas por ahora.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {proyectosEnRiesgo.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Proyectos ({proyectosEnRiesgo.length})
              </h2>
              <ul className="mt-3 space-y-2">
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
                        <span className="shrink-0 text-xs text-text-muted">
                          {SEMAFORO_LABEL[semaforo]}
                        </span>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {solicitudesEnRiesgo.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Solicitudes ({solicitudesEnRiesgo.length})
              </h2>
              <ul className="mt-3 space-y-2">
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
                          {dias < 0 ? `Vencida hace ${Math.abs(dias)}d` : dias === 0 ? "Vence hoy" : `Vence en ${dias}d`}
                        </span>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
