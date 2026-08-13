"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "rcd-os-theme";
type Theme = "light" | "dark" | "system";

// Script sincrono que corre antes del primer paint (ver layout.tsx) para
// fijar data-theme en <html> segun lo guardado en localStorage, evitando el
// flash de tema incorrecto (FOUC) que un useEffect no puede evitar.
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;

// localStorage no dispara nada dentro de la misma pestaña al escribir (el
// evento "storage" solo llega a otras pestañas), asi que se necesita un
// mini store con listeners propios para que useSyncExternalStore detecte el
// cambio que produce el propio click en este componente.
const listeners = new Set<() => void>();

function leerTema(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function temaServidor(): Theme {
  return "system";
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function aplicarTema(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  listeners.forEach((callback) => callback());
}

const SIGUIENTE: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const CONFIG_POR_TEMA: Record<Theme, { icono: typeof Sun; etiqueta: string }> = {
  system: { icono: Monitor, etiqueta: "Automático" },
  light: { icono: Sun, etiqueta: "Claro" },
  dark: { icono: Moon, etiqueta: "Oscuro" },
};

export function ThemeToggle({ className = "" }: { className?: string }) {
  // getServerSnapshot ("system") se usa para el render inicial en el
  // servidor y para el primer render en el cliente durante la hidratacion
  // (asi coinciden y no hay mismatch); React re-sincroniza solo justo
  // despues con el valor real de localStorage via leerTema().
  const theme = useSyncExternalStore(subscribe, leerTema, temaServidor);
  const { icono: Icono, etiqueta } = CONFIG_POR_TEMA[theme];

  return (
    <button
      type="button"
      onClick={() => aplicarTema(SIGUIENTE[theme])}
      title="Cambiar tema (claro / oscuro / automático)"
      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text ${className}`}
    >
      <Icono size={17} strokeWidth={2} />
      Tema: {etiqueta}
    </button>
  );
}
