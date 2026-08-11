import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      {usuario.rol ? (
        <p className="text-lg">
          Hola {usuario.nombre ?? usuario.email} — {usuario.rol.nombre}
        </p>
      ) : (
        <p className="text-sm text-neutral-600">
          Cuenta pendiente de configuracion, contacta a tu lider tecnico.
        </p>
      )}

      <LogoutButton />
    </main>
  );
}
