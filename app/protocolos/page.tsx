import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Ruta protegida por proxy.ts: nunca debe quedar cacheada estaticamente, y
// ademas depende de datos reales de Supabase que no existen en build time.
export const dynamic = "force-dynamic";

export default async function ProtocolosPage() {
  const protocolos = await prisma.protocolo.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <main className="flex-1 p-8">
      <h1 className="mb-6 text-lg font-medium">Protocolos</h1>

      <ul className="space-y-3">
        {protocolos.map((protocolo) => (
          <li key={protocolo.id}>
            <Link
              href={`/protocolos/${protocolo.id}`}
              className="block rounded border border-neutral-200 p-4 hover:border-neutral-400"
            >
              <p className="font-medium">{protocolo.nombre}</p>
              <p className="text-sm text-neutral-600">{protocolo.objetivo}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
