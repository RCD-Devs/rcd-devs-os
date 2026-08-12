import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Ruta protegida por proxy.ts: nunca debe quedar cacheada estaticamente, y
// ademas depende de datos reales de Supabase que no existen en build time.
export const dynamic = "force-dynamic";

export default async function ProtocolosPage() {
  const protocolos = await prisma.protocolo.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Protocolos</h1>
        <Link href="/protocolos/nuevo">
          <Button variant="primary">
            <Plus size={16} strokeWidth={2} />
            Nuevo protocolo
          </Button>
        </Link>
      </div>

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
