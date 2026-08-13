"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";

type Usuario = { id: string; nombre: string | null; email: string };

// Combobox con busqueda para elegir un Usuario entre una lista (#17 de
// MEJORAS-PROPUESTAS.md) — reemplaza un <select> simple, que se vuelve
// incomodo de recorrer a medida que crece el equipo.
export function UsuarioPicker({
  usuarios,
  value,
  onChange,
  disabled = false,
  placeholder = "Sin asignar",
  className = "",
}: {
  usuarios: Usuario[];
  value: string | null;
  onChange: (usuarioId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const seleccionado = usuarios.find((u) => u.id === value) ?? null;

  useEffect(() => {
    function alClickearFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alClickearFuera);
    return () => document.removeEventListener("mousedown", alClickearFuera);
  }, []);

  const q = busqueda.trim().toLowerCase();
  const filtrados = q
    ? usuarios.filter(
        (u) => (u.nombre ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    : usuarios;

  function elegir(usuarioId: string | null) {
    onChange(usuarioId);
    setAbierto(false);
    setBusqueda("");
  }

  return (
    <div ref={contenedorRef} className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        <Input
          id={id}
          type="text"
          value={abierto ? busqueda : (seleccionado?.nombre ?? seleccionado?.email ?? "")}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setAbierto(true)}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setAbierto(true);
          }}
          autoComplete="off"
        />
        {seleccionado && !disabled && (
          <button
            type="button"
            onClick={() => elegir(null)}
            aria-label="Quitar seleccion"
            className="shrink-0 text-text-muted hover:text-text"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {abierto && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full min-w-48 overflow-auto rounded-md border border-border bg-surface py-1 text-sm shadow-md">
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir(null)}
              className="block w-full px-3 py-1.5 text-left text-text-muted hover:bg-surface-hover"
            >
              Sin asignar
            </button>
          </li>
          {filtrados.length === 0 ? (
            <li className="px-3 py-1.5 text-text-muted">Sin resultados</li>
          ) : (
            filtrados.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(u.id)}
                  className="block w-full truncate px-3 py-1.5 text-left hover:bg-surface-hover"
                >
                  {u.nombre ?? u.email}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
