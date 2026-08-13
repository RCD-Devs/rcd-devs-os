"use client";

import { useId, useState, type FormEvent } from "react";
import { crearCliente } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function NuevoClienteForm() {
  const idBase = useId();
  const [nombre, setNombre] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoEmail, setContactoEmail] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [rubro, setRubro] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setNombre("");
    setContactoNombre("");
    setContactoEmail("");
    setContactoTelefono("");
    setRubro("");
    setSitioWeb("");
    setNotas("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await crearCliente({
        nombre,
        contactoNombre,
        contactoEmail,
        contactoTelefono,
        rubro,
        sitioWeb,
        notas,
      });
      limpiar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Nuevo cliente
      </h2>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-nombre`} className="text-sm text-text-muted">
          Nombre
        </label>
        <Input
          id={`${idBase}-nombre`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del cliente"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor={`${idBase}-contacto-nombre`} className="text-sm text-text-muted">
            Persona de contacto
          </label>
          <Input
            id={`${idBase}-contacto-nombre`}
            value={contactoNombre}
            onChange={(e) => setContactoNombre(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idBase}-rubro`} className="text-sm text-text-muted">
            Rubro / industria
          </label>
          <Input id={`${idBase}-rubro`} value={rubro} onChange={(e) => setRubro(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idBase}-contacto-email`} className="text-sm text-text-muted">
            Email de contacto
          </label>
          <Input
            id={`${idBase}-contacto-email`}
            type="email"
            value={contactoEmail}
            onChange={(e) => setContactoEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor={`${idBase}-contacto-telefono`} className="text-sm text-text-muted">
            Teléfono de contacto
          </label>
          <Input
            id={`${idBase}-contacto-telefono`}
            value={contactoTelefono}
            onChange={(e) => setContactoTelefono(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor={`${idBase}-sitio-web`} className="text-sm text-text-muted">
            Sitio web
          </label>
          <Input
            id={`${idBase}-sitio-web`}
            value={sitioWeb}
            onChange={(e) => setSitioWeb(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-notas`} className="text-sm text-text-muted">
          Notas internas
        </label>
        <Input id={`${idBase}-notas`} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Creando..." : "Crear cliente"}
      </Button>
    </form>
  );
}
