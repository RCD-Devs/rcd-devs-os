"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IniciarProtocoloButton({
  proyectoId,
  protocoloId,
}: {
  proyectoId: string;
  protocoloId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/ejecucion-protocolo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proyectoId, protocoloId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo iniciar el protocolo");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Iniciando..." : "Iniciar protocolo"}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
