"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { actualizarPerfil } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function PerfilForm({ nombreInicial }: { nombreInicial: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const idBase = useId();
  const [nombre, setNombre] = useState(nombreInicial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await actualizarPerfil(nombre);
      showToast("Perfil actualizado");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-nombre`} className="text-sm text-text-muted">
          Nombre
        </label>
        <Input
          id={`${idBase}-nombre`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
