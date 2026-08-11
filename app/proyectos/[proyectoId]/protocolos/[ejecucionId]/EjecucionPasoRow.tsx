"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <li className="rounded border border-neutral-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">{paso.pasoNombre}</p>

        <select
          value={estado}
          disabled={saving}
          onChange={(e) => {
            const nuevoEstado = e.target.value;
            setEstado(nuevoEstado);
            guardar({ estado: nuevoEstado });
          }}
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        >
          {estadosValidos.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Evidencia (link, opcional)"
          value={evidenciaUrl}
          disabled={saving}
          onChange={(e) => setEvidenciaUrl(e.target.value)}
          onBlur={() => guardar({ evidenciaUrl })}
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Notas (opcional)"
          value={notas}
          disabled={saving}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={() => guardar({ notas })}
          className="rounded border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </li>
  );
}
