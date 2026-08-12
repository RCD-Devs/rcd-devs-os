import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditarProtocoloForm } from "../EditarProtocoloForm";
import { slugify } from "@/lib/slug";

export default async function EditarProtocoloPage({
  params,
}: {
  params: Promise<{ protocoloSlug: string }>;
}) {
  const { protocoloSlug } = await params;

  const candidatos = await prisma.protocolo.findMany({ select: { id: true, nombre: true } });
  const protocoloId = candidatos.find((p) => slugify(p.nombre) === protocoloSlug)?.id;

  if (!protocoloId) {
    notFound();
  }

  const protocolo = await prisma.protocolo.findUnique({
    where: { id: protocoloId },
    include: { versiones: { orderBy: { numeroVersion: "desc" }, take: 1 } },
  });

  if (!protocolo) {
    notFound();
  }

  const versionVigente = protocolo.versiones[0];
  const pasos = (versionVigente?.pasosJson as unknown as Array<{ nombre: string }>) ?? [];

  if (!versionVigente) {
    return (
      <div>
        <p className="text-sm text-text-muted">
          Este protocolo todavia no tiene una version publicada para editar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/protocolos/${protocoloSlug}`}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        {protocolo.nombre}
      </Link>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-text">
        Editar checklist — {protocolo.nombre}
      </h1>

      <div className="mt-6">
        <EditarProtocoloForm
          protocoloId={protocolo.id}
          protocoloSlug={protocoloSlug}
          numeroVersionVigente={versionVigente.numeroVersion}
          pasosIniciales={pasos.map((p) => p.nombre)}
        />
      </div>
    </div>
  );
}
