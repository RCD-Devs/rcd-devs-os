"use client";

import { useRouter } from "next/navigation";
import { eliminarProyecto } from "./actions";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { useToast } from "@/components/ui/Toast";

export function EliminarProyectoButton({ proyectoId }: { proyectoId: string }) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <ConfirmDeleteButton
      label="Eliminar proyecto"
      confirmLabel="¿Eliminar este proyecto? No se puede deshacer."
      onConfirm={async () => {
        const result = await eliminarProyecto(proyectoId);
        if (!result.ok) {
          showToast(result.error, "error");
        } else {
          showToast("Proyecto eliminado");
          router.push("/proyectos");
        }
      }}
    />
  );
}
