"use client";

import { useState, useTransition } from "react";
import { KeyRound, Pencil } from "lucide-react";
import {
  actualizarRolUsuario,
  actualizarEmailUsuario,
  restablecerPasswordUsuario,
  eliminarUsuario,
} from "./actions";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { useToast } from "@/components/ui/Toast";
import { generarPasswordTemporal } from "@/lib/passwordTemporal";

export function UsuarioRow({
  usuario,
  roles,
  esUsuarioActual,
}: {
  usuario: { id: string; nombre: string | null; email: string; rolId: string | null };
  roles: Array<{ id: string; nombre: string }>;
  esUsuarioActual: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [email, setEmail] = useState(usuario.email);

  function guardarEmail() {
    const correo = email.trim();
    if (!correo || correo === usuario.email) {
      setEditandoEmail(false);
      return;
    }
    startTransition(async () => {
      try {
        await actualizarEmailUsuario(usuario.id, correo);
        showToast("Correo actualizado");
        setEditandoEmail(false);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "No se pudo actualizar el correo", "error");
      }
    });
  }

  function restablecerPassword() {
    const nueva = generarPasswordTemporal();
    startTransition(async () => {
      try {
        await restablecerPasswordUsuario(usuario.id, nueva);
        showToast(`Contraseña restablecida: ${nueva}`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "No se pudo restablecer", "error");
      }
    });
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar nombre={usuario.nombre ?? usuario.email} />
        <div>
          {usuario.nombre && <p className="font-medium">{usuario.nombre}</p>}
          {editandoEmail ? (
            <div className="mt-1 flex items-center gap-1">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="h-7 py-1 text-sm"
                autoFocus
              />
              <Button type="button" onClick={guardarEmail} disabled={isPending} className="h-7 px-2 text-xs">
                Guardar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEmail(usuario.email);
                  setEditandoEmail(false);
                }}
                disabled={isPending}
                className="h-7 px-2 text-xs"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditandoEmail(true)}
              className={`flex items-center gap-1 hover:text-accent ${
                usuario.nombre ? "text-sm text-text-muted" : "font-medium text-text"
              }`}
            >
              {usuario.email}
              <Pencil size={11} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          defaultValue={usuario.rolId ?? ""}
          disabled={isPending}
          onChange={(e) => {
            const rolId = e.target.value;
            startTransition(async () => {
              try {
                await actualizarRolUsuario(usuario.id, rolId);
                showToast("Rol actualizado");
              } catch (err) {
                showToast(err instanceof Error ? err.message : "No se pudo guardar", "error");
              }
            });
          }}
        >
          <option value="">Sin rol</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          onClick={restablecerPassword}
          disabled={isPending}
          title="Restablecer contraseña"
        >
          <KeyRound size={14} strokeWidth={2} />
        </Button>

        {!esUsuarioActual && (
          <ConfirmDeleteButton
            label="Eliminar"
            confirmLabel="¿Eliminar esta cuenta? No se puede deshacer."
            onConfirm={async () => {
              try {
                await eliminarUsuario(usuario.id);
                showToast("Usuario eliminado");
              } catch (err) {
                showToast(err instanceof Error ? err.message : "No se pudo eliminar", "error");
              }
            }}
          />
        )}
      </div>
    </Card>
  );
}
