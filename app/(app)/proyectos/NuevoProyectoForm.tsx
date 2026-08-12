"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { crearProyecto } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { slugConId } from "@/lib/slug";

export function NuevoProyectoForm({
  clientes,
  etapas,
}: {
  clientes: Array<{ id: string; nombre: string }>;
  etapas: Array<{ id: string; nombre: string; orden: number }>;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [etapaActualId, setEtapaActualId] = useState(etapas[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const proyecto = await crearProyecto({ nombre, clienteId, etapaActualId });
      router.push(`/proyectos/${slugConId(proyecto.nombre, proyecto.id)}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "No se pudo crear el proyecto");
    }
  }

  if (clientes.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Primero crea un cliente en{" "}
        <a href="/clientes" className="text-accent underline">
          Clientes
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="nombre-proyecto" className="text-sm text-text-muted">
          Nombre del proyecto
        </label>
        <Input
          id="nombre-proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="cliente" className="text-sm text-text-muted">
          Cliente
        </label>
        <Select
          id="cliente"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full"
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="etapa" className="text-sm text-text-muted">
          Etapa inicial
        </label>
        <Select
          id="etapa"
          value={etapaActualId}
          onChange={(e) => setEtapaActualId(e.target.value)}
          className="w-full"
        >
          {etapas.map((etapa) => (
            <option key={etapa.id} value={etapa.id}>
              {etapa.orden}. {etapa.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Creando..." : "Crear proyecto"}
        </Button>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
