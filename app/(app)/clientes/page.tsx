import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevoClienteForm } from "./NuevoClienteForm";
import { ClientesList } from "./ClientesList";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    include: { _count: { select: { proyectos: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Clientes</h1>

      <Card className="mt-4">
        <NuevoClienteForm />
      </Card>

      <ClientesList clientes={clientes} />
    </div>
  );
}
