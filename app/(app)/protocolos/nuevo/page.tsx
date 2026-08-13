import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { NuevoProtocoloForm } from "../NuevoProtocoloForm";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { puedeCrear } from "@/lib/auth/permisos";

export default async function NuevoProtocoloPage() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    redirect("/login");
  }
  if (!(await puedeCrear(usuario, "protocolos"))) {
    redirect("/protocolos");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Nuevo protocolo</h1>

      <Card className="mt-6 max-w-xl">
        <NuevoProtocoloForm />
      </Card>
    </div>
  );
}
