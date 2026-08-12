"use client";

import { useState, type FormEvent } from "react";
import { crearCliente } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NuevoClienteForm() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await crearCliente(nombre);
      setNombre("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="nombre-cliente" className="text-sm text-text-muted">
            Nuevo cliente
          </label>
          <Input
            id="nombre-cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del cliente"
            required
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Creando..." : "Crear"}
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </form>
  );
}
