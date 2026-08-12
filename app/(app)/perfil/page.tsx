import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Card } from "@/components/ui/Card";
import { PerfilForm } from "./PerfilForm";

// Ruta protegida por proxy.ts, depende de datos reales de Supabase: nunca
// prerenderizar estaticamente (mismo criterio que /protocolos).
export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Perfil</h1>
      <p className="mt-2 text-sm text-text-muted">
        Datos de tu cuenta. El nombre es lo que se muestra en el saludo del dashboard y en el
        resto de la app.
      </p>

      <Card className="mt-6 max-w-md">
        <PerfilForm nombreInicial={usuario.nombre ?? ""} />

        <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <p className="flex items-center justify-between">
            <span className="text-text-muted">Correo</span>
            <span className="font-mono text-xs">{usuario.email}</span>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-text-muted">Rol</span>
            <span>{usuario.rol?.nombre ?? "Sin asignar"}</span>
          </p>
        </div>
      </Card>

      {!usuario.rol && (
        <p className="mt-4 text-sm text-text-muted">
          Todavia no tienes un rol asignado — contacta a tu líder técnico o director/a para que te
          asigne uno desde Roles.
        </p>
      )}
    </div>
  );
}
