import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/ui/PrintButton";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { contarProgreso } from "@/lib/protocolos/estados";
import { calcularSemaforo, SEMAFORO_LABEL } from "@/lib/proyectos/semaforo";

// Snapshot de "estado de todos los proyectos" para compartir en una reunion
// (roadmap #35) — mismo patron que la vista imprimible de un checklist:
// pagina dedicada, sin sidebar, con print:hidden en los controles.
export default async function ImprimirDashboardPage() {
  const usuario = await getCurrentUser();
  if (!usuario) {
    redirect("/login");
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { archivado: false },
    include: {
      cliente: true,
      etapaActual: true,
      ejecucionesProtocolo: { include: { pasos: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const filas = proyectos.map((proyecto) => {
    const pasos = proyecto.ejecucionesProtocolo.flatMap((e) => e.pasos);
    const progreso = contarProgreso(pasos);
    const semaforo = calcularSemaforo(proyecto);
    return { proyecto, progreso, semaforo };
  });

  const totalProyectos = filas.length;
  const proyectosEnRiesgo = filas.filter((f) => f.semaforo !== "verde").length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Dashboard
        </Link>
        <PrintButton />
      </div>

      <h1 className="text-2xl font-bold text-text">Estado de proyectos — RCD OS</h1>
      <p className="mt-1 text-xs text-text-muted">
        {totalProyectos} proyecto{totalProyectos === 1 ? "" : "s"} activo
        {totalProyectos === 1 ? "" : "s"} · {proyectosEnRiesgo} con plazo en riesgo · Generado el{" "}
        {new Date().toLocaleDateString("es-CL")}
      </p>

      {filas.length === 0 ? (
        <p className="mt-8 text-sm text-text-muted">No hay proyectos activos.</p>
      ) : (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-muted uppercase">
              <th className="py-2 pr-3">Proyecto</th>
              <th className="py-2 pr-3">Cliente</th>
              <th className="py-2 pr-3">Etapa</th>
              <th className="py-2 pr-3">Progreso</th>
              <th className="py-2">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ proyecto, progreso, semaforo }) => (
              <tr key={proyecto.id} className="border-b border-border break-inside-avoid">
                <td className="py-2 pr-3 font-medium text-text">{proyecto.nombre}</td>
                <td className="py-2 pr-3 text-text-muted">{proyecto.cliente.nombre}</td>
                <td className="py-2 pr-3 text-text-muted">{proyecto.etapaActual.nombre}</td>
                <td className="py-2 pr-3 text-text-muted">
                  {progreso.total > 0 ? `${progreso.completos}/${progreso.total} pasos` : "—"}
                </td>
                <td className="py-2 text-text-muted">{SEMAFORO_LABEL[semaforo]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
