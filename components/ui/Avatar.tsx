import { TONE_BG_TEXT, toneFromString } from "@/lib/ui/tone";

function iniciales(nombre: string): string {
  const letras = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? "");
  return letras.join("") || "?";
}

export function Avatar({ nombre, size = 32 }: { nombre: string; size?: number }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${TONE_BG_TEXT[toneFromString(nombre)]}`}
      style={{ width: size, height: size }}
    >
      {iniciales(nombre)}
    </div>
  );
}
