"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle size={32} strokeWidth={2} className="text-warning" />
      <div>
        <h1 className="text-lg font-semibold text-text">Algo salió mal</h1>
        <p className="mt-1 text-sm text-text-muted">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver más tarde.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-text-muted">Código: {error.digest}</p>
        )}
      </div>
      <Button type="button" variant="primary" onClick={retry}>
        Reintentar
      </Button>
    </div>
  );
}
