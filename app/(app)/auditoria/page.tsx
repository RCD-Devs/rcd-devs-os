import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

const LIMITE = 100;

export default async function AuditoriaPage() {
  const eventos = await prisma.eventoAuditoria.findMany({
    include: { usuario: true },
    orderBy: { createdAt: "desc" },
    take: LIMITE,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Auditoría</h1>
      <p className="mt-2 text-sm text-text-muted">
        Registro append-only de cambios clave (últimos {LIMITE}). Solo lectura: no se puede editar
        ni borrar desde la app.
      </p>

      {eventos.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay eventos registrados.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="rounded-full bg-neutral-badge-bg px-2 py-0.5 text-xs font-medium text-neutral-badge">
                    {evento.entidad}
                  </span>
                  <span className="font-medium">{evento.accion}</span>
                  <span className="truncate text-text-muted">
                    por {evento.usuario?.nombre ?? evento.usuario?.email ?? "sistema"}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-text-muted">
                  {evento.createdAt.toLocaleString("es-CL")}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
