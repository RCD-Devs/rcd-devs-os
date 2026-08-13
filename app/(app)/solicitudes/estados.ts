// Separado de actions.ts a proposito: un archivo "use server" en Next.js
// solo puede exportar funciones async (cualquier otro export - una
// constante, un tipo - hace que el POST de CUALQUIER accion de ese archivo
// falle en runtime con "A 'use server' file can only export async
// functions", incluso si esa funcion en particular no usa el export roto).
export const ESTADOS_SOLICITUD = ["Pendiente", "En curso", "Resuelta", "Rechazada"];
