import { describe, expect, it, vi } from "vitest";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("permite requests mientras no se supere el limite", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).permitido).toBe(true);
    expect(rateLimit(key, 3, 60_000).permitido).toBe(true);
    expect(rateLimit(key, 3, 60_000).permitido).toBe(true);
  });

  it("bloquea una vez superado el limite dentro de la ventana", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const tercero = rateLimit(key, 2, 60_000);
    expect(tercero.permitido).toBe(false);
    expect(tercero.reintentarEnMs).toBeGreaterThan(0);
  });

  it("resetea el contador una vez que pasa la ventana", () => {
    vi.useFakeTimers();
    try {
      const key = `test-${Math.random()}`;
      rateLimit(key, 1, 1_000);
      expect(rateLimit(key, 1, 1_000).permitido).toBe(false);

      vi.advanceTimersByTime(1_001);

      expect(rateLimit(key, 1, 1_000).permitido).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("no mezcla contadores de keys distintas", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    rateLimit(keyA, 1, 60_000);
    expect(rateLimit(keyA, 1, 60_000).permitido).toBe(false);
    expect(rateLimit(keyB, 1, 60_000).permitido).toBe(true);
  });
});
