"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { crearUsuario } from "./actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { generarPasswordTemporal } from "@/lib/passwordTemporal";

export function InvitarUsuarioForm({ roles }: { roles: Array<{ id: string; nombre: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const idBase = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generarPasswordTemporal());
  const [rolId, setRolId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await crearUsuario(email, password, rolId);
    if (!result.ok) {
      setError(result.error);
    } else {
      showToast(`Cuenta creada. Contraseña: ${password}`);
      setEmail("");
      setPassword(generarPasswordTemporal());
      router.refresh();
    }
    setLoading(false);
  }

  function copiarPassword() {
    navigator.clipboard.writeText(password);
    showToast("Contraseña copiada");
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
        <label htmlFor={`${idBase}-password`} className="text-sm text-text-muted">
          Contraseña temporal
        </label>
        <div className="flex items-center gap-1">
          <Input
            id={`${idBase}-password`}
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="font-mono"
          />
          <button
            type="button"
            onClick={copiarPassword}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text"
            title="Copiar contraseña"
          >
            <Copy size={16} strokeWidth={2} />
          </button>
        </div>
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
        {loading ? "Creando..." : "Crear usuario"}
      </Button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <p className="w-full text-xs text-text-muted">
        La cuenta queda activa de inmediato. Comparte el correo y la contraseña con la persona por
        un canal seguro.
      </p>
    </form>
  );
}
