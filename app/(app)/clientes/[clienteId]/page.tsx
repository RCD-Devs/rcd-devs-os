import Link from "next/link";
import { ChevronLeft, FolderKanban } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { EtapaBadge } from "@/components/ui/EtapaBadge";
import { EditarClienteForm } from "./EditarClienteForm";
import { EliminarClienteButton } from "./EliminarClienteButton";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { slugConId } from "@/lib/slug";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;

  const [cliente, usuario] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { proyectos: { include: { etapaActual: true }, orderBy: { nombre: "asc" } } },
    }),
    getCurrentUser(),
  ]);

  if (!cliente) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/clientes"
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Clientes
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">{cliente.nombre}</h1>

      <Card className="mt-6 max-w-2xl">
        <EditarClienteForm cliente={cliente} />
      </Card>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-text-muted">
        Proyectos ({cliente.proyectos.length})
      </h2>
      {cliente.proyectos.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">Todavia no tiene proyectos.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {cliente.proyectos.map((proyecto) => (
            <li key={proyecto.id}>
              <Link href={`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`}>
                <Card className="flex items-center justify-between gap-3 transition-colors hover:border-accent">
                  <span className="flex items-center gap-2 font-medium">
                    <FolderKanban size={14} strokeWidth={2} className="text-text-muted" />
                    {proyecto.nombre}
                  </span>
                  <EtapaBadge
                    nombre={proyecto.etapaActual.nombre}
                    orden={proyecto.etapaActual.orden}
                  />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {esAdmin(usuario) && (
        <div className="mt-10 border-t border-border pt-6">
          <EliminarClienteButton clienteId={cliente.id} />
        </div>
      )}
    </div>
  );
}
