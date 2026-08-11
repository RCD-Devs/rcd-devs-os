import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

// Roles fijos del roadmap (RCD-OS-Roadmap.md #2). titular_id/reemplazo_id se
// completan a mano despues, no hay UI de administracion todavia.
const ROLES = [
  "Líder técnico",
  "Infraestructura / Plataforma",
  "Desarrollador backend/frontend",
  "Líder de proyecto/cliente",
  "Legal",
];

async function seedRoles() {
  for (const nombre of ROLES) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
}

async function main() {
  await seedRoles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
