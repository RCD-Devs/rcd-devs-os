"use client";

import { useSyncExternalStore } from "react";

export type ChartTheme = {
  series: string[];
  text: string;
  muted: string;
  grid: string;
  surface: string;
};

const FALLBACK: ChartTheme = {
  series: ["#2563eb", "#7c3aed", "#0d9488", "#d97706", "#e11d48"],
  text: "#171717",
  muted: "#6b6b6b",
  grid: "#e5e5e5",
  surface: "#ffffff",
};

function readTheme(): ChartTheme {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;

  return {
    series: [
      read("--color-chart-1", FALLBACK.series[0]),
      read("--color-chart-2", FALLBACK.series[1]),
      read("--color-chart-3", FALLBACK.series[2]),
      read("--color-chart-4", FALLBACK.series[3]),
      read("--color-chart-5", FALLBACK.series[4]),
    ],
    text: read("--color-text", FALLBACK.text),
    muted: read("--color-text-muted", FALLBACK.muted),
    grid: read("--color-border", FALLBACK.grid),
    surface: read("--color-surface", FALLBACK.surface),
  };
}

// getSnapshot debe devolver la misma referencia mientras nada cambio real
// (si no, useSyncExternalStore entra en loop): el snapshot se cachea aca y
// solo se recalcula cuando el listener de subscribe lo invalida.
let cachedSnapshot: ChartTheme | null = null;

function getSnapshot(): ChartTheme {
  if (!cachedSnapshot) {
    cachedSnapshot = readTheme();
  }
  return cachedSnapshot;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    cachedSnapshot = readTheme();
    onChange();
  };
  media.addEventListener("change", handleChange);
  return () => media.removeEventListener("change", handleChange);
}

// Chart.js pinta en <canvas>, que no resuelve var() como el CSS del resto de la
// app: hay que leer los valores computados del DOM. useSyncExternalStore es la
// via correcta para eso (evita el hydration mismatch de SSR y se re-sincroniza
// solo si el usuario cambia el esquema de color del sistema en caliente).
export function useChartTheme(): ChartTheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => FALLBACK);
}
