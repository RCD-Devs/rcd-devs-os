"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmDeleteButton({
  label,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirmando) {
    return (
      <Button type="button" onClick={() => setConfirmando(true)} className="text-red-600">
        <Trash2 size={14} strokeWidth={2} />
        {label}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-text-muted">{confirmLabel}</span>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(onConfirm)}
        className="border-red-600 text-red-600"
      >
        Sí, eliminar
      </Button>
      <Button type="button" onClick={() => setConfirmando(false)} disabled={isPending}>
        Cancelar
      </Button>
    </div>
  );
}
