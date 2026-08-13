import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { ProtocolosList } from "./ProtocolosList";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { puedeCrear } from "@/lib/auth/permisos";

// Ruta protegida por proxy.ts: nunca debe quedar cacheada estaticamente, y
// ademas depende de datos reales de Supabase que no existen en build time.
export const dynamic = "force-dynamic";

export default async function ProtocolosPage() {
  const usuario = await getCurrentUser();
  const puedeCrearProtocolos = await puedeCrear(usuario, "protocolos");

  const [protocolos, ejecuciones] = await Promise.all([
    prisma.protocolo.findMany({
      orderBy: { nombre: "asc" },
      include: { versiones: { orderBy: { numeroVersion: "desc" }, take: 1 } },
    }),
    prisma.ejecucionProtocolo.findMany({
      select: { proyectoId: true, versionProtocolo: { select: { protocoloId: true } } },
    }),
  ]);

  // Los proyectos/ejecuciones que usan cada protocolo se cuelgan de
  // VersionProtocolo, no de Protocolo directamente: se agrega en memoria en
  // vez de un groupBy, dado que el catalogo de protocolos es chico.
  const proyectosPorProtocolo = new Map<string, Set<string>>();
  const ejecucionesPorProtocolo = new Map<string, number>();
  for (const ejecucion of ejecuciones) {
    const protocoloId = ejecucion.versionProtocolo.protocoloId;
    ejecucionesPorProtocolo.set(protocoloId, (ejecucionesPorProtocolo.get(protocoloId) ?? 0) + 1);
    const proyectos = proyectosPorProtocolo.get(protocoloId) ?? new Set<string>();
    proyectos.add(ejecucion.proyectoId);
    proyectosPorProtocolo.set(protocoloId, proyectos);
  }

  // Map/Set no cruzan bien la frontera server->client component: se resuelve
  // todo a un array plano de resumenes antes de pasarlo al componente cliente.
  const resumenes = protocolos.map((protocolo) => {
    const versionVigente = protocolo.versiones[0];
    const pasos = (versionVigente?.pasosJson as unknown as unknown[]) ?? [];

    return {
      id: protocolo.id,
      nombre: protocolo.nombre,
      objetivo: protocolo.objetivo,
      numeroVersion: versionVigente?.numeroVersion ?? null,
      pasosCount: pasos.length,
      nProyectos: proyectosPorProtocolo.get(protocolo.id)?.size ?? 0,
      nEjecuciones: ejecucionesPorProtocolo.get(protocolo.id) ?? 0,
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Protocolos</h1>
        {puedeCrearProtocolos && (
          <Link href="/protocolos/nuevo">
            <Button variant="primary">
              <Plus size={16} strokeWidth={2} />
              Nuevo protocolo
            </Button>
          </Link>
        )}
      </div>

      <ProtocolosList protocolos={resumenes} />
    </div>
  );
}
