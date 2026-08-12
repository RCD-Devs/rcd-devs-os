// Slugs generados al vuelo desde el nombre, sin campo en la base de datos:
// Protocolo.nombre ya es unico (constraint en el schema), asi que su slug
// alcanza solo con el nombre. Proyecto.nombre no es unico, asi que se le
// agrega un sufijo corto y deterministico del id para evitar colisiones.

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function idCorto(id: string): string {
  return id.replace(/-/g, "").slice(0, 8);
}

export function slugConId(nombre: string, id: string): string {
  return `${slugify(nombre)}-${idCorto(id)}`;
}
