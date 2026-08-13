"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { crearProtocolo } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/slug";

export function NuevoProtocoloForm() {
  const router = useRouter();
  const idBase = useId();
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [alcance, setAlcance] = useState("");
  const [pasos, setPasos] = useState<string[]>(["", ""]);
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await crearProtocolo({ nombre, objetivo, alcance, pasos });
      if (!result.ok) {
        setError(result.error);
      } else {
        router.push(`/protocolos/${slugify(result.data.nombre)}`);
        return;
      }
    } catch {
      setError("Ocurrio un error inesperado, intenta de nuevo");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-nombre`} className="text-sm text-text-muted">
          Nombre del protocolo
        </label>
        <Input id={`${idBase}-nombre`} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-objetivo`} className="text-sm text-text-muted">
          Objetivo
        </label>
        <Input
          id={`${idBase}-objetivo`}
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-alcance`} className="text-sm text-text-muted">
          Alcance (opcional)
        </label>
        <Input id={`${idBase}-alcance`} value={alcance} onChange={(e) => setAlcance(e.target.value)} />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-text-muted">
          Pasos del checklist ({pasos.length}). Estados: Pendiente / En curso / Completo / No aplica.
        </p>

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

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Creando..." : "Crear protocolo"}
      </Button>
    </form>
  );
}
