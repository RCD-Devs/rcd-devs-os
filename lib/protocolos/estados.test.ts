import { describe, expect, it } from "vitest";
import { calcularEstadoEjecucion, contarProgreso, esEstadoTerminal, esEstadoValido } from "./estados";

describe("esEstadoValido", () => {
  const estados = ["Pendiente", "En curso", "Completo", "No aplica"];

  it("acepta un estado que esta en la lista", () => {
    expect(esEstadoValido(estados, "Completo")).toBe(true);
  });

  it("rechaza un estado que no esta en la lista", () => {
    expect(esEstadoValido(estados, "Implementado")).toBe(false);
  });
});

describe("esEstadoTerminal", () => {
  it("Pendiente y En curso no son terminales", () => {
    expect(esEstadoTerminal("Pendiente")).toBe(false);
    expect(esEstadoTerminal("En curso")).toBe(false);
  });

  it("cualquier otro estado es terminal, sin importar el protocolo", () => {
    expect(esEstadoTerminal("Completo")).toBe(true);
    expect(esEstadoTerminal("No aplica")).toBe(true);
    expect(esEstadoTerminal("Implementado")).toBe(true);
  });
});

describe("calcularEstadoEjecucion", () => {
  it("queda En curso si algun paso no esta en estado terminal", () => {
    const pasos = [{ estado: "Completo" }, { estado: "Pendiente" }];
    expect(calcularEstadoEjecucion(pasos)).toBe("En curso");
  });

  it("pasa a Completo cuando todos los pasos estan en estado terminal", () => {
    const pasos = [{ estado: "Completo" }, { estado: "No aplica" }];
    expect(calcularEstadoEjecucion(pasos)).toBe("Completo");
  });

  it("una lista de pasos vacia no se considera Completa", () => {
    expect(calcularEstadoEjecucion([])).toBe("En curso");
  });
});

describe("contarProgreso", () => {
  it("cuenta solo los pasos en estado terminal", () => {
    const pasos = [{ estado: "Completo" }, { estado: "Pendiente" }, { estado: "No aplica" }];
    expect(contarProgreso(pasos)).toEqual({ completos: 2, total: 3 });
  });

  it("una lista vacia da 0/0", () => {
    expect(contarProgreso([])).toEqual({ completos: 0, total: 0 });
  });
});
