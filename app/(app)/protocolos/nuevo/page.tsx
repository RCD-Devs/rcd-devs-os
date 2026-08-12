import { Card } from "@/components/ui/Card";
import { NuevoProtocoloForm } from "../NuevoProtocoloForm";

export default function NuevoProtocoloPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Nuevo protocolo</h1>

      <Card className="mt-6 max-w-xl">
        <NuevoProtocoloForm />
      </Card>
    </div>
  );
}
