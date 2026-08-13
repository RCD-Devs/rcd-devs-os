"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { duplicarProtocolo } from "../actions";
import { slugify } from "@/lib/slug";
import { useToast } from "@/components/ui/Toast";

export function DuplicarProtocoloButton({ protocoloId }: { protocoloId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function duplicar() {
    setLoading(true);
    const result = await duplicarProtocolo(protocoloId);
    setLoading(false);

    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }

    showToast(`Creado "${result.data.nombre}" — edítalo a gusto`);
    router.push(`/protocolos/${slugify(result.data.nombre)}/editar`);
  }

  return (
    <button
      type="button"
      onClick={duplicar}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-accent hover:underline disabled:opacity-50"
    >
      <Copy size={12} strokeWidth={2} />
      {loading ? "Duplicando..." : "Duplicar"}
    </button>
  );
}
