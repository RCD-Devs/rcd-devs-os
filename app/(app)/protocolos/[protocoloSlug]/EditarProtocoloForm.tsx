"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { crearNuevaVersionProtocolo } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function EditarProtocoloForm({
  protocoloId,
  protocoloSlug,
  numeroVersionVigente,
  pasosIniciales,
}: {
  protocoloId: string;
  protocoloSlug: string;
  numeroVersionVigente: number;
  pasosIniciales: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pasos, setPasos] = useState<string[]>(pasosIniciales);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizarPaso(i: number, valor: string) {
    setPasos((prev) => prev.map((p, idx) => (idx === i ? valor : p)));
  }

  function agregarPaso() {
    setPasos((prev) => [...prev, ""]);
  }

  function quitarPaso(i: number) {
    setPasos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function moverPaso(i: number, direccion: -1 | 1) {
    setPasos((prev) => {
      const destino = i + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });
  }

  async function guardar() {
    setLoading(true);
    setError(null);

    const result = await crearNuevaVersionProtocolo(protocoloId, pasos);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    } else {
      showToast(`Version v${numeroVersionVigente + 1} publicada`);
      router.push(`/protocolos/${protocoloSlug}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Editar aca publica una <strong>v{numeroVersionVigente + 1}</strong> nueva — las ejecuciones
        ya iniciadas con v{numeroVersionVigente} no se ven afectadas.
      </p>

      <div className="space-y-2">
        {pasos.map((paso, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={paso}
              onChange={(e) => actualizarPaso(i, e.target.value)}
              placeholder={`Paso ${i + 1}`}
              required
            />
            <Button
              type="button"
              onClick={() => moverPaso(i, -1)}
              disabled={i === 0}
              aria-label="Subir paso"
              className="px-2"
            >
              <ArrowUp size={15} />
            </Button>
            <Button
              type="button"
              onClick={() => moverPaso(i, 1)}
              disabled={i === pasos.length - 1}
              aria-label="Bajar paso"
              className="px-2"
            >
              <ArrowDown size={15} />
            </Button>
            <Button
              type="button"
              onClick={() => quitarPaso(i)}
              disabled={pasos.length === 1}
              aria-label="Quitar paso"
              className="px-2 text-red-600"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        ))}

        <Button type="button" onClick={agregarPaso} className="mt-1">
          <Plus size={15} />
          Agregar paso
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="button" variant="primary" onClick={guardar} disabled={loading}>
        {loading ? "Publicando..." : `Publicar v${numeroVersionVigente + 1}`}
      </Button>
    </div>
  );
}
