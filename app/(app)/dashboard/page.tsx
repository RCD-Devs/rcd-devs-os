import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { contarProgreso } from "@/lib/protocolos/estados";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  const [proyectos, protocolos] = await Promise.all([
    prisma.proyecto.findMany({
      include: {
        cliente: true,
        ejecucionesProtocolo: {
          include: { versionProtocolo: { include: { protocolo: true } }, pasos: true },
        },
      },
      orderBy: { nombre: "asc" },
    }),
    prisma.protocolo.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-lg font-medium">
        Hola {usuario.nombre ?? usuario.email}
        {usuario.rol ? ` — ${usuario.rol.nombre}` : ""}
      </h1>

      {!usuario.rol && (
        <p className="mt-2 text-sm text-text-muted">
          Cuenta pendiente de configuracion, contacta a tu lider tecnico.
        </p>
      )}

      <h2 className="mt-8 text-sm font-medium text-text">Proyectos</h2>

      {proyectos.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          Todavia no hay proyectos.{" "}
          <Link href="/proyectos" className="text-accent underline">
            Crear uno
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-2 space-y-3">
          {proyectos.map((proyecto) => (
            <li key={proyecto.id}>
              <Card>
                <Link href={`/proyectos/${proyecto.id}`} className="font-medium hover:text-accent">
                  {proyecto.nombre}
                </Link>
                <p className="text-sm text-text-muted">{proyecto.cliente.nombre}</p>

                <ul className="mt-3 space-y-1.5">
                  {protocolos.map((protocolo) => {
                    const ejecucion = proyecto.ejecucionesProtocolo.find(
                      (e) => e.versionProtocolo.protocolo.id === protocolo.id,
                    );
                    const progreso = ejecucion ? contarProgreso(ejecucion.pasos) : null;

                    return (
                      <li key={protocolo.id} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-text-muted">{protocolo.nombre}</span>
                        {progreso ? (
                          <ProgressBar value={progreso.completos} max={progreso.total} />
                        ) : (
                          <span className="font-mono text-xs text-text-muted">sin iniciar</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
