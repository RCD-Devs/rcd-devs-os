import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

// Ruta protegida por proxy.ts: nunca debe quedar cacheada estaticamente, y
// ademas depende de datos reales de Supabase que no existen en build time.
export const dynamic = "force-dynamic";

export default async function ProtocolosPage() {
  const protocolos = await prisma.protocolo.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Protocolos</h1>

      <ul className="space-y-3">
        {protocolos.map((protocolo) => (
          <li key={protocolo.id}>
            <Link href={`/protocolos/${protocolo.id}`}>
              <Card className="transition-colors hover:border-accent">
                <p className="font-medium">{protocolo.nombre}</p>
                <p className="mt-1 text-sm text-text-muted">{protocolo.objetivo}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
