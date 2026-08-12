import { redirect } from "next/navigation";
import { Building2, CircleCheckBig, FolderKanban, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { BarChart } from "@/components/charts/BarChart";
import { DoughnutChart } from "@/components/charts/DoughnutChart";
import { ChartCard } from "@/components/ui/ChartCard";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardProyectos } from "./DashboardProyectos";

// Orden de lectura preferido para el doughnut de pasos; cualquier estado
// adicional definido por un protocolo (estadosJson) cae al final, alfabetico.
const ORDEN_ESTADOS = ["Pendiente", "En curso", "Completo", "No aplica"];

function ordenarEstados(estados: string[]): string[] {
  return [...estados].sort((a, b) => {
    const ia = ORDEN_ESTADOS.indexOf(a);
    const ib = ORDEN_ESTADOS.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  const [proyectos, protocolos, clientesTotales, etapas] = await Promise.all([
    prisma.proyecto.findMany({
      include: {
        cliente: true,
        etapaActual: true,
        ejecucionesProtocolo: {
          include: { versionProtocolo: { include: { protocolo: true } }, pasos: true },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.protocolo.findMany({ orderBy: { nombre: "asc" } }),
    prisma.cliente.count(),
    prisma.etapa.findMany({ orderBy: { orden: "asc" } }),
  ]);

  const todasLasEjecuciones = proyectos.flatMap((p) => p.ejecucionesProtocolo);
  const protocolosEnCurso = todasLasEjecuciones.filter((e) => e.estado !== "Completo").length;
  const protocolosCompletos = todasLasEjecuciones.filter((e) => e.estado === "Completo").length;

  const todosLosPasos = todasLasEjecuciones.flatMap((e) => e.pasos);
  const conteoPorEstado = new Map<string, number>();
  for (const paso of todosLosPasos) {
    conteoPorEstado.set(paso.estado, (conteoPorEstado.get(paso.estado) ?? 0) + 1);
  }
  const estadosOrdenados = ordenarEstados([...conteoPorEstado.keys()]);

  const conteoPorEtapa = new Map(etapas.map((etapa) => [etapa.id, 0]));
  for (const proyecto of proyectos) {
    conteoPorEtapa.set(proyecto.etapaActualId, (conteoPorEtapa.get(proyecto.etapaActualId) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">
        Hola {usuario.nombre ?? usuario.email}
        {usuario.rol ? ` — ${usuario.rol.nombre}` : ""}
      </h1>

      {!usuario.rol && (
        <p className="mt-2 text-sm text-text-muted">
          Cuenta pendiente de configuracion, contacta a tu lider tecnico.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Proyectos" value={proyectos.length} icon={FolderKanban} tone={1} />
        <StatCard label="Clientes" value={clientesTotales} icon={Building2} tone={3} />
        <StatCard
          label="Protocolos en curso"
          value={protocolosEnCurso}
          icon={ListChecks}
          tone={4}
        />
        <StatCard
          label="Protocolos completos"
          value={protocolosCompletos}
          icon={CircleCheckBig}
          tone={2}
        />
      </div>

      {todosLosPasos.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Pasos por estado" subtitle="Todas las ejecuciones activas">
            <DoughnutChart
              labels={estadosOrdenados}
              values={estadosOrdenados.map((estado) => conteoPorEstado.get(estado) ?? 0)}
            />
          </ChartCard>
          <ChartCard title="Proyectos por etapa" subtitle="Distribucion en el ciclo de vida">
            <BarChart
              labels={etapas.map((etapa) => etapa.nombre)}
              values={etapas.map((etapa) => conteoPorEtapa.get(etapa.id) ?? 0)}
            />
          </ChartCard>
        </div>
      )}

      <DashboardProyectos proyectos={proyectos} protocolos={protocolos} />
    </div>
  );
}
