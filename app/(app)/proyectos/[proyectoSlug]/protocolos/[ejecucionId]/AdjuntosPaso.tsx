"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  ACCEPT_INPUT_EVIDENCIA,
  BUCKET_EVIDENCIA,
  PREFIJO_STORAGE,
  validarArchivoEvidencia,
} from "@/lib/evidencia";

function nombreVisible(valor: string): string {
  if (valor.startsWith(PREFIJO_STORAGE)) {
    return valor.slice(PREFIJO_STORAGE.length).split("/").pop() ?? valor;
  }
  return valor;
}

async function abrirAdjunto(valor: string) {
  if (!valor.startsWith(PREFIJO_STORAGE)) {
    window.open(valor, "_blank", "noopener,noreferrer");
    return;
  }
  const supabase = createClient();
  const path = valor.slice(PREFIJO_STORAGE.length);
  const { data } = await supabase.storage.from(BUCKET_EVIDENCIA).createSignedUrl(path, 3600);
  if (data?.signedUrl) {
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
}

// Multiples adjuntos por paso (#11 de MEJORAS-PROPUESTAS.md): reemplaza a
// EvidenciaField (un solo valor) como forma de agregar evidencia nueva, pero
// sigue mostrando el valor legacy si el paso ya tenia uno (evidenciaLegacy),
// con boton propio para quitarlo via el mismo mecanismo de guardado del
// paso (onQuitarLegacy), sin migrar ese dato a la tabla nueva.
export function AdjuntosPaso({
  pasoId,
  evidencias,
  evidenciaLegacy,
  disabled,
  onQuitarLegacy,
  onCambio,
}: {
  pasoId: string;
  evidencias: Array<{ id: string; valor: string }>;
  evidenciaLegacy: string | null;
  disabled: boolean;
  onQuitarLegacy: () => void;
  onCambio: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function agregar(valor: string) {
    const res = await fetch(`/api/ejecucion-paso/${pasoId}/evidencias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo agregar el adjunto");
      return;
    }

    setError(null);
    onCambio();
  }

  async function agregarLink() {
    const valor = link.trim();
    if (!valor) return;
    await agregar(valor);
    setLink("");
  }

  async function subirArchivo(file: File) {
    const errorValidacion = validarArchivoEvidencia(file);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setSubiendo(true);
    const supabase = createClient();
    const objectPath = `${pasoId}/${Date.now()}-${file.name}`;
    const { error: errorUpload } = await supabase.storage
      .from(BUCKET_EVIDENCIA)
      .upload(objectPath, file);

    if (errorUpload) {
      setSubiendo(false);
      setError("No se pudo subir el archivo");
      return;
    }

    await agregar(`${PREFIJO_STORAGE}${objectPath}`);
    setSubiendo(false);
  }

  async function eliminar(evidenciaId: string) {
    setEliminandoId(evidenciaId);
    const res = await fetch(`/api/ejecucion-paso/${pasoId}/evidencias/${evidenciaId}`, {
      method: "DELETE",
    });
    setEliminandoId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo quitar el adjunto");
      return;
    }

    setError(null);
    onCambio();
  }

  return (
    <div className="space-y-1.5">
      {evidenciaLegacy && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
          <FileText size={15} strokeWidth={2} className="shrink-0 text-text-muted" />
          <button
            type="button"
            onClick={() => abrirAdjunto(evidenciaLegacy)}
            className="truncate text-accent hover:underline"
          >
            {nombreVisible(evidenciaLegacy)}
          </button>
          <button
            type="button"
            onClick={onQuitarLegacy}
            disabled={disabled}
            aria-label="Quitar evidencia"
            className="ml-auto shrink-0 text-text-muted hover:text-text disabled:opacity-50"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {evidencias.map((ev) => (
        <div
          key={ev.id}
          className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <FileText size={15} strokeWidth={2} className="shrink-0 text-text-muted" />
          <button
            type="button"
            onClick={() => abrirAdjunto(ev.valor)}
            className="truncate text-accent hover:underline"
          >
            {nombreVisible(ev.valor)}
          </button>
          <button
            type="button"
            onClick={() => eliminar(ev.id)}
            disabled={disabled || eliminandoId === ev.id}
            aria-label="Quitar adjunto"
            className="ml-auto shrink-0 text-text-muted hover:text-text disabled:opacity-50"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-1.5">
        <Input
          type="text"
          placeholder="Agregar evidencia (link)"
          value={link}
          disabled={disabled || subiendo}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregarLink();
            }
          }}
        />
        <button
          type="button"
          onClick={agregarLink}
          disabled={disabled || subiendo || !link.trim()}
          aria-label="Agregar link de evidencia"
          title="Agregar link"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-text disabled:opacity-50"
        >
          <Plus size={15} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || subiendo}
          aria-label="Subir archivo de evidencia"
          title="Subir archivo"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-text-muted hover:bg-surface-hover hover:text-text disabled:opacity-50"
        >
          <Paperclip size={15} strokeWidth={2} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_INPUT_EVIDENCIA}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) subirArchivo(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
