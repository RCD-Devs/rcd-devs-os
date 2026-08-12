import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { NuevoClienteForm } from "./NuevoClienteForm";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Clientes</h1>

      <Card className="mt-4">
        <NuevoClienteForm />
      </Card>

      {clientes.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay clientes.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <Card>{cliente.nombre}</Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
