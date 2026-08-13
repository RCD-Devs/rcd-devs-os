"use client";

import { useRouter } from "next/navigation";
import { eliminarCliente } from "../actions";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { useToast } from "@/components/ui/Toast";

export function EliminarClienteButton({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <ConfirmDeleteButton
      label="Eliminar cliente"
      confirmLabel="¿Eliminar este cliente? No se puede deshacer."
      onConfirm={async () => {
        const result = await eliminarCliente(clienteId);
        if (!result.ok) {
          showToast(result.error, "error");
        } else {
          showToast("Cliente eliminado");
          router.push("/clientes");
        }
      }}
    />
  );
}
