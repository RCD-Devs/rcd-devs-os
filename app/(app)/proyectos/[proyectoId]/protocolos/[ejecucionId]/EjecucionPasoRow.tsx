"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

export function EjecucionPasoRow({
  paso,
  estadosValidos,
}: {
  paso: {
    id: string;
    pasoNombre: string;
    estado: string;
    notas: string | null;
    evidenciaUrl: string | null;
    fechaEjecucion: Date | null;
    responsable: { nombre: string | null; email: string } | null;
  };
  estadosValidos: string[];
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(paso.estado);
  const [notas, setNotas] = useState(paso.notas ?? "");
  const [evidenciaUrl, setEvidenciaUrl] = useState(paso.evidenciaUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(cambios: Partial<{ estado: string; notas: string; evidenciaUrl: string }>) {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/ejecucion-paso/${paso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar el cambio");
      return;
    }

    router.refresh();
  }

  return (
    <Card as="li">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">{paso.pasoNombre}</p>

        <Select
          value={estado}
          disabled={saving}
          onChange={(e) => {
            const nuevoEstado = e.target.value;
            setEstado(nuevoEstado);
            guardar({ estado: nuevoEstado });
          }}
          className="shrink-0"
        >
          {estadosValidos.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Input
          type="text"
          placeholder="Evidencia (link, opcional)"
          value={evidenciaUrl}
          disabled={saving}
          onChange={(e) => setEvidenciaUrl(e.target.value)}
          onBlur={() => guardar({ evidenciaUrl })}
        />
        <Input
          type="text"
          placeholder="Notas (opcional)"
          value={notas}
          disabled={saving}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => guardar({ notas })}
        />
      </div>

      {paso.fechaEjecucion && (
        <p className="mt-2 font-mono text-xs text-text-muted">
          Marcado por {paso.responsable?.nombre ?? paso.responsable?.email ?? "?"} el{" "}
          {new Date(paso.fechaEjecucion).toLocaleDateString("es-CL")}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
