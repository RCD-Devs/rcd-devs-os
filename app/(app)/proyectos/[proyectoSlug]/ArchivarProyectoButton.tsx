"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { archivarProyecto } from "./actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ArchivarProyectoButton({
  proyectoId,
  proyectoSlug,
  archivado,
}: {
  proyectoId: string;
  proyectoSlug: string;
  archivado: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function alternar() {
    startTransition(async () => {
      const result = await archivarProyecto(proyectoId, !archivado, proyectoSlug);
      if (!result.ok) {
        showToast(result.error, "error");
      } else {
        showToast(archivado ? "Proyecto desarchivado" : "Proyecto archivado");
      }
    });
  }

  return (
    <Button type="button" onClick={alternar} disabled={isPending}>
      {archivado ? (
        <ArchiveRestore size={14} strokeWidth={2} />
      ) : (
        <Archive size={14} strokeWidth={2} />
      )}
      {archivado ? "Desarchivar" : "Archivar proyecto"}
    </Button>
  );
}
