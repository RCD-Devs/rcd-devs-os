// Compartido entre EvidenciaField.tsx (campo legacy, un solo valor) y
// AdjuntosPaso.tsx (multiples adjuntos, #11 de MEJORAS-PROPUESTAS.md): mismo
// bucket, mismos limites, mismo formato de valor ("storage:<path>" o link
// externo tal cual).
export const BUCKET_EVIDENCIA = "evidencia";
export const PREFIJO_STORAGE = "storage:";

export const TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15MB
export const TIPOS_PERMITIDOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];
export const ACCEPT_INPUT_EVIDENCIA = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv";

// Validacion solo client-side: el upload va directo del browser al bucket de
// Storage (no pasa por una Server Action/API route), asi que esto es UX, no
// un limite de seguridad real. Ver comentario mas largo en EvidenciaField.
export function validarArchivoEvidencia(file: File): string | null {
  if (file.size > TAMANO_MAXIMO_BYTES) {
    return `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)}MB, el máximo es 15MB`;
  }
  if (file.type && !TIPOS_PERMITIDOS.includes(file.type)) {
    return "Tipo de archivo no permitido (imagen, PDF, Word, Excel, texto o CSV)";
  }
  return null;
}
