import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { InvitarUsuarioForm } from "./InvitarUsuarioForm";
import { UsuarioRow } from "./UsuarioRow";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { esAdmin } from "@/lib/auth/esAdmin";
import { getRoles } from "@/lib/catalogos";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const usuarioActual = await getCurrentUser();

  if (!usuarioActual) {
    redirect("/login");
  }
  // Mismo criterio que /roles: solo Lider tecnico y Director/a.
  if (!esAdmin(usuarioActual)) {
    redirect("/dashboard");
  }

  const [usuarios, roles] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { email: "asc" } }),
    getRoles(),
  ]);

  const invitacionesHabilitadas = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Usuarios</h1>
      <p className="mt-2 text-sm text-text-muted">
        Cuentas con acceso a la plataforma y su rol asignado.
      </p>

      <Card className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Crear usuario
        </h2>
        {invitacionesHabilitadas ? (
          <InvitarUsuarioForm roles={roles} />
        ) : (
          <p className="text-sm text-text-muted">
            Crear usuarios nuevos requiere configurar{" "}
            <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en las variables
            de entorno (Project Settings → API en Supabase → service_role key). Mientras tanto,
            los usuarios se crean directo desde el dashboard de Supabase — aparecen acá
            automáticamente para asignarles un rol.
          </p>
        )}
      </Card>

      {usuarios.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Todavia no hay usuarios.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {usuarios.map((usuario) => (
            <li key={usuario.id}>
              <UsuarioRow
                usuario={usuario}
                roles={roles}
                esUsuarioActual={usuario.id === usuarioActual.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
