"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "evidencia";
const PREFIJO_STORAGE = "storage:";

// Convencion sobre el campo de texto existente (evidencia_url) en vez de una
// columna nueva: si el valor empieza con "storage:" es un path dentro del
// bucket privado de Supabase Storage, si no, es un link externo tal cual se
// guardaba antes. El bucket es privado -> las URLs de lectura se firman al
// vuelo, no se guardan URLs publicas permanentes.
export function EvidenciaField({
  pasoId,
  value,
  disabled,
  onChange,
  onGuardarInmediato,
}: {
  pasoId: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onGuardarInmediato: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const esArchivo = value.startsWith(PREFIJO_STORAGE);
  const path = esArchivo ? value.slice(PREFIJO_STORAGE.length) : null;
  const nombreArchivo = path ? path.split("/").pop() : null;

  async function subirArchivo(file: File) {
    setSubiendo(true);
    setErrorSubida(null);

    const supabase = createClient();
    const objectPath = `${pasoId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, file);

    setSubiendo(false);

    if (error) {
      setErrorSubida("No se pudo subir el archivo");
      return;
    }

    const nuevoValor = `${PREFIJO_STORAGE}${objectPath}`;
    onChange(nuevoValor);
    onGuardarInmediato(nuevoValor);
  }

  async function verArchivo() {
    if (!path) return;
    const supabase = createClient();
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }

  if (esArchivo) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
        <FileText size={15} strokeWidth={2} className="shrink-0 text-text-muted" />
        <button
          type="button"
          onClick={verArchivo}
          className="truncate text-accent hover:underline"
        >
          {nombreArchivo}
        </button>
        <button
          type="button"
          onClick={() => {
            onChange("");
            onGuardarInmediato("");
          }}
          aria-label="Quitar evidencia"
          className="ml-auto shrink-0 text-text-muted hover:text-text"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <Input
          type="text"
          placeholder="Evidencia (link, opcional)"
          value={value}
          disabled={disabled || subiendo}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onGuardarInmediato(value)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || subiendo}
          aria-label="Subir archivo de evidencia"
          title="Subir archivo"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-text-muted hover:bg-bg hover:text-text disabled:opacity-50"
        >
          <Paperclip size={15} strokeWidth={2} />
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) subirArchivo(file);
            e.target.value = "";
          }}
        />
      </div>
      {errorSubida && <p className="mt-1 text-xs text-red-600">{errorSubida}</p>}
    </div>
  );
}
