"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { invitarUsuario } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function InvitarUsuarioForm({ roles }: { roles: Array<{ id: string; nombre: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const idBase = useId();
  const [email, setEmail] = useState("");
  const [rolId, setRolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await invitarUsuario(email, rolId);
      setEmail("");
      showToast("Invitación enviada");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo invitar al usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor={`${idBase}-email`} className="text-sm text-text-muted">
          Correo
        </label>
        <Input
          id={`${idBase}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@rcd.cl"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idBase}-rol`} className="text-sm text-text-muted">
          Rol (opcional)
        </label>
        <Select id={`${idBase}-rol`} value={rolId} onChange={(e) => setRolId(e.target.value)}>
          <option value="">Sin asignar</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Enviando..." : "Invitar"}
      </Button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
