export const TONES = [1, 2, 3, 4, 5] as const;
export type Tone = (typeof TONES)[number];

export const TONE_BG_TEXT: Record<Tone, string> = {
  1: "bg-chart-1-bg text-chart-1",
  2: "bg-chart-2-bg text-chart-2",
  3: "bg-chart-3-bg text-chart-3",
  4: "bg-chart-4-bg text-chart-4",
  5: "bg-chart-5-bg text-chart-5",
};

// Hash simple y estable (misma entrada -> mismo tono siempre) para asignar
// color a entidades sin un campo de color propio (clientes, protocolos).
export function toneFromString(value: string): Tone {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return TONES[Math.abs(hash) % TONES.length];
}
