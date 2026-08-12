import { SEMAFORO_DOT_CLASS, SEMAFORO_LABEL, type Semaforo } from "@/lib/proyectos/semaforo";

export function SemaforoDot({ semaforo }: { semaforo: Semaforo }) {
  return (
    <span
      className={`inline-block size-2.5 shrink-0 rounded-full ${SEMAFORO_DOT_CLASS[semaforo]}`}
      title={SEMAFORO_LABEL[semaforo]}
      role="img"
      aria-label={SEMAFORO_LABEL[semaforo]}
    />
  );
}
