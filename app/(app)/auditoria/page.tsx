import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { ExportarCsvButton } from "./ExportarCsvButton";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

const TAMANO_PAGINA = 50;

type FiltrosAuditoria = {
  desde?: string;
  hasta?: string;
  usuarioId?: string;
  entidad?: string;
  page?: string;
};

function hrefConPagina(filtros: FiltrosAuditoria, page: number): string {
  const params = new URLSearchParams();
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  if (filtros.usuarioId) params.set("usuarioId", filtros.usuarioId);
  if (filtros.entidad) params.set("entidad", filtros.entidad);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/auditoria?${qs}` : "/auditoria";
}

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<FiltrosAuditoria>;
}) {
  const usuarioActual = await getCurrentUser();

  if (!usuarioActual) {
    redirect("/login");
  }
  // Mismo criterio que /usuarios y /roles: solo Lider tecnico y Director/a.
  if (!esAdmin(usuarioActual)) {
    redirect("/dashboard");
  }

  const filtros = await searchParams;
  const { desde, hasta, usuarioId, entidad } = filtros;
  const page = Math.max(1, Number(filtros.page) || 1);

  const where: Prisma.EventoAuditoriaWhereInput = {};
  if (usuarioId) where.usuarioId = usuarioId;
  if (entidad) where.entidad = entidad;
  if (desde || hasta) {
    where.createdAt = {
      // "hasta" es un <input type="date">: sin hora, asi que se toma como
      // fin de ese dia (23:59:59) para que incluya los eventos del dia
      // seleccionado, no solo hasta la medianoche.
      ...(desde ? { gte: new Date(`${desde}T00:00:00`) } : {}),
      ...(hasta ? { lte: new Date(`${hasta}T23:59:59.999`) } : {}),
    };
  }

  const hayFiltros = Boolean(desde || hasta || usuarioId || entidad);

  const [eventos, totalEventos, usuarios, entidades] = await Promise.all([
    prisma.eventoAuditoria.findMany({
      where,
      include: { usuario: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * TAMANO_PAGINA,
      take: TAMANO_PAGINA,
    }),
    prisma.eventoAuditoria.count({ where }),
    prisma.usuario.findMany({ orderBy: { nombre: "asc" } }),
    prisma.eventoAuditoria.findMany({
      distinct: ["entidad"],
      select: { entidad: true },
      orderBy: { entidad: "asc" },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(totalEventos / TAMANO_PAGINA));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Auditoría</h1>
          <p className="mt-2 text-sm text-text-muted">
            Registro append-only de cambios clave — {totalEventos} evento
            {totalEventos === 1 ? "" : "s"}
            {hayFiltros ? " que calzan con el filtro" : ""}. Solo lectura: no se puede editar ni
            borrar desde la app.
          </p>
        </div>
        {eventos.length > 0 && <ExportarCsvButton eventos={eventos} />}
      </div>

      <Card className="mt-4">
        <form className="flex flex-wrap items-end gap-3" action="/auditoria">
          <div className="space-y-1">
            <label htmlFor="desde" className="text-xs text-text-muted">
              Desde
            </label>
            <Input id="desde" name="desde" type="date" defaultValue={desde} className="w-fit" />
          </div>
          <div className="space-y-1">
            <label htmlFor="hasta" className="text-xs text-text-muted">
              Hasta
            </label>
            <Input id="hasta" name="hasta" type="date" defaultValue={hasta} className="w-fit" />
          </div>
          <div className="space-y-1">
            <label htmlFor="usuarioId" className="text-xs text-text-muted">
              Usuario
            </label>
            <Select id="usuarioId" name="usuarioId" defaultValue={usuarioId ?? ""}>
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre ?? u.email}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="entidad" className="text-xs text-text-muted">
              Entidad
            </label>
            <Select id="entidad" name="entidad" defaultValue={entidad ?? ""}>
              <option value="">Todas</option>
              {entidades.map((e) => (
                <option key={e.entidad} value={e.entidad}>
                  {e.entidad}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="primary">
            Filtrar
          </Button>
          {hayFiltros && (
            <a href="/auditoria" className="text-sm text-text-muted hover:text-text hover:underline">
              Limpiar
            </a>
          )}
        </form>
      </Card>

      {eventos.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          {hayFiltros
            ? "Ningun evento coincide con el filtro."
            : "Todavia no hay eventos registrados."}
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="rounded-full bg-neutral-badge-bg px-2 py-0.5 text-xs font-medium text-neutral-badge">
                    {evento.entidad}
                  </span>
                  <span className="font-medium">{evento.accion}</span>
                  <span className="truncate text-text-muted">
                    por {evento.usuario?.nombre ?? evento.usuario?.email ?? "sistema"}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-text-muted">
                  {evento.createdAt.toLocaleString("es-CL")}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href={hrefConPagina(filtros, page - 1)}
            aria-disabled={page <= 1}
            className={`inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "text-text hover:bg-surface-hover"
            }`}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Anterior
          </Link>
          <span className="font-mono text-xs text-text-muted">
            Página {page} de {totalPaginas}
          </span>
          <Link
            href={hrefConPagina(filtros, page + 1)}
            aria-disabled={page >= totalPaginas}
            className={`inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs ${
              page >= totalPaginas
                ? "pointer-events-none opacity-40"
                : "text-text hover:bg-surface-hover"
            }`}
          >
            Siguiente
            <ChevronRight size={14} strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
