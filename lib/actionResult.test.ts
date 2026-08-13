import { describe, expect, it } from "vitest";
import { fail, ok, type ActionResult } from "./actionResult";

describe("ok", () => {
  it("produce un resultado con ok:true y el data provisto", () => {
    const result = ok({ id: "abc" });
    expect(result).toEqual({ ok: true, data: { id: "abc" } });
  });
});

describe("fail", () => {
  it("produce un resultado con ok:false y el mensaje provisto", () => {
    const result = fail("No autenticado");
    expect(result).toEqual({ ok: false, error: "No autenticado" });
  });
});

describe("angostamiento de tipos (discriminante ok)", () => {
  it("una funcion consumidora puede angostar por result.ok sin acceso a data/error invalido", () => {
    function mensaje(result: ActionResult<{ nombre: string }>): string {
      if (!result.ok) {
        return result.error;
      }
      return result.data.nombre;
    }

    expect(mensaje(ok({ nombre: "Acme" }))).toBe("Acme");
    expect(mensaje(fail("Ya existe un cliente con ese nombre"))).toBe(
      "Ya existe un cliente con ese nombre",
    );
  });
});
