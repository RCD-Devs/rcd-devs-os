import { describe, expect, it } from "vitest";
import { slugConId, slugify } from "./slug";

describe("slugify", () => {
  it("pasa a minusculas y reemplaza espacios por guiones", () => {
    expect(slugify("Seguridad WordPress")).toBe("seguridad-wordpress");
  });

  it("quita tildes y otros diacriticos", () => {
    expect(slugify("Creación de ambientes")).toBe("creacion-de-ambientes");
  });

  it("colapsa caracteres no alfanumericos consecutivos en un solo guion", () => {
    expect(slugify("Cookies & protección de datos!!")).toBe("cookies-proteccion-de-datos");
  });

  it("quita guiones al principio y al final", () => {
    expect(slugify("  -Elementos básicos-  ")).toBe("elementos-basicos");
  });
});

describe("slugConId", () => {
  it("agrega un sufijo corto y deterministico basado en el id", () => {
    const slug = slugConId("Landing Estudio Lumen", "a2ee2b6d-3285-4c38-88cd-6911a707afa6");
    expect(slug).toBe("landing-estudio-lumen-a2ee2b6d");
  });

  it("dos proyectos con el mismo nombre generan slugs distintos", () => {
    const slugA = slugConId("Sitio Web", "11111111-2222-3333-4444-555555555555");
    const slugB = slugConId("Sitio Web", "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    expect(slugA).not.toBe(slugB);
  });
});
