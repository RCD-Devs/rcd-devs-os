"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button type="button" variant="primary" onClick={() => window.print()}>
      <Printer size={16} strokeWidth={2} />
      Imprimir / Guardar PDF
    </Button>
  );
}
