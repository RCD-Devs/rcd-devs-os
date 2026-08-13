"use client";

import { useId, useState, type FormEvent } from "react";
import { actualizarCliente } from "../actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ClienteData = {
  id: string;
  nombre: string;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  rubro: string | null;
  sitioWeb: string | null;
  notas: string | null;
};

export function EditarClienteForm({ cliente }: { cliente: ClienteData }) {
  const { showToast } = useToast();
  const idBase = useId();
  const [nombre, setNombre] = useState(cliente.nombre);
  const [contactoNombre, setContactoNombre] = useState(cliente.contactoNombre ?? "");
  const [contactoEmail, setContactoEmail] = useState(cliente.contactoEmail ?? "");
  const [contactoTelefono, setContactoTelefono] = useState(cliente.contactoTelefono ?? "");
  const [rubro, setRubro] = useState(cliente.rubro ?? "");
  const [sitioWeb, setSitioWeb] = useState(cliente.sitioWeb ?? "");
  const [notas, setNotas] = useState(cliente.notas ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await actualizarCliente(cliente.id, {
        nombre,
        contactoNombre,
        contactoEmail,
        contactoTelefono,
        rubro,
        sitioWeb,
        notas,
      });
      showToast("Cliente actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-nombre`} className="text-sm text-text-muted">
          Nombre
        </label>
        <Input id={`${idBase}-nombre`} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
