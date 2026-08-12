import {
  ClipboardCheck,
  FileCheck2,
  ListChecks,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { toneFromString, type Tone } from "@/lib/ui/tone";

// Los protocolos no tienen un campo de icono propio en el schema: se asigna
// un icono fijo por tono (mismo hash que el color) para que cada protocolo
// se vea siempre igual sin necesitar un campo nuevo en la base de datos.
const ICONO_POR_TONO: Record<Tone, LucideIcon> = {
  1: ShieldCheck,
  2: ClipboardCheck,
  3: FileCheck2,
  4: ListChecks,
  5: Settings2,
};

export function iconoProtocolo(id: string): LucideIcon {
  return ICONO_POR_TONO[toneFromString(id)];
}
