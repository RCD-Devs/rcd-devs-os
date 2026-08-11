import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function DashboardPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-lg font-medium">
        Hola {usuario.nombre ?? usuario.email}
        {usuario.rol ? ` — ${usuario.rol.nombre}` : ""}
      </h1>

      {!usuario.rol && (
        <p className="mt-2 text-sm text-text-muted">
          Cuenta pendiente de configuracion, contacta a tu lider tecnico.
        </p>
      )}
    </div>
  );
}
