"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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

    try {
      const res = await fetch("/api/ejecucion-protocolo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId, protocoloId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo iniciar el protocolo");
        return;
      }

      router.refresh();
    } catch {
      setError("Ocurrio un error inesperado, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="primary" onClick={handleClick} disabled={loading}>
        {loading ? "Iniciando..." : "Iniciar protocolo"}
      </Button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
