import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Driver adapter (pg) en vez del motor nativo de Prisma: evita el
// PrismaClientInitializationError de "Query Engine no encontrado" que daba
// en Vercel con el motor binario (ver comentario en schema.prisma).
//
// `max` bajo a proposito: DATABASE_URL ya pasa por el pooler de Supabase
// (pgbouncer, puerto 6543), asi que este pool de `pg` es el numero de
// conexiones que UNA instancia de funcion (Fluid Compute puede reusarla para
// varios requests concurrentes) abre contra el pooler, no contra Postgres
// directo. Con muchas instancias funcion en paralelo, un `max` alto por
// instancia multiplica innecesariamente las conexiones reales.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
