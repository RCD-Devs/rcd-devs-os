import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Datos de ejemplo (ficticios) para visualizar la plataforma con data real.
// Script aparte de prisma/seed.ts a proposito: no corre en `prisma db seed`
// (ese sigue siendo solo catalogos: roles, etapas, protocolos). Este es un
// insert manual, pensado para un entorno de dev/staging, no para producción.
// Re-ejecutable: usa findFirst por nombre antes de crear, no duplica.

const CLIENTES = ["Café Nube", "Ferretería Bravo", "Estudio Lumen"];

// Estados por paso de "Elementos básicos de sitio web", en el mismo orden que
// el seed real (roadmap #4.1). null = protocolo no iniciado en ese proyecto.
const AVANCES: Record<string, string[] | null> = {
  "Sitio Café Nube": [
    "Completo", "Completo", "Completo", "Completo", "Completo",
    "Completo", "Completo", "Completo", "Completo", "No aplica",
    "En curso", "Pendiente", "Pendiente", "Pendiente",
  ],
  "Portal Café Nube Delivery": [
    "Completo", "Completo", "Completo", "Completo", "Completo",
    "Completo", "Completo", "Completo", "Completo", "Completo",
    "Completo", "Completo", "Completo", "No aplica",
  ],
  "Rediseño Ferretería Bravo": Array(14).fill("Pendiente"),
  "Landing Estudio Lumen": null,
};

const PROYECTOS: Array<{ nombre: string; cliente: string; etapa: string }> = [
  { nombre: "Sitio Café Nube", cliente: "Café Nube", etapa: "QA" },
  { nombre: "Portal Café Nube Delivery", cliente: "Café Nube", etapa: "Paso a producción" },
  { nombre: "Rediseño Ferretería Bravo", cliente: "Ferretería Bravo", etapa: "Desarrollo" },
  { nombre: "Landing Estudio Lumen", cliente: "Estudio Lumen", etapa: "Diseño / definición funcional" },
];

async function findOrCreateCliente(nombre: string) {
  const existente = await prisma.cliente.findFirst({ where: { nombre } });
  if (existente) return existente;
  return prisma.cliente.create({ data: { nombre } });
}

async function findOrCreateProyecto(nombre: string, clienteId: string, etapaActualId: string) {
  const existente = await prisma.proyecto.findFirst({ where: { nombre } });
  if (existente) return existente;
  return prisma.proyecto.create({ data: { nombre, clienteId, etapaActualId } });
}

async function iniciarEjecucionSiNoExiste(proyectoId: string, estadosPasos: string[]) {
  const protocolo = await prisma.protocolo.findUnique({
    where: { nombre: "Elementos básicos de sitio web" },
  });
  if (!protocolo) throw new Error("Corre `npx prisma db seed` primero (faltan los protocolos).");

  const yaExiste = await prisma.ejecucionProtocolo.findFirst({
    where: { proyectoId, versionProtocolo: { protocoloId: protocolo.id } },
  });
  if (yaExiste) return;

  const version = await prisma.versionProtocolo.findFirstOrThrow({
    where: { protocoloId: protocolo.id },
    orderBy: { numeroVersion: "desc" },
  });
  const pasos = version.pasosJson as unknown as Array<{ nombre: string }>;

  const todosTerminales = estadosPasos.every((e) => e === "Completo" || e === "No aplica");

  await prisma.ejecucionProtocolo.create({
    data: {
      proyectoId,
      versionProtocoloId: version.id,
      estado: todosTerminales ? "Completo" : "En curso",
      pasos: {
        create: pasos.map((paso, i) => ({
          pasoNombre: paso.nombre,
          estado: estadosPasos[i],
          fechaEjecucion:
            estadosPasos[i] === "Completo" || estadosPasos[i] === "No aplica" ? new Date() : null,
        })),
      },
    },
  });
}

async function main() {
  const clientesPorNombre = new Map<string, string>();
  for (const nombre of CLIENTES) {
    const cliente = await findOrCreateCliente(nombre);
    clientesPorNombre.set(nombre, cliente.id);
  }

  for (const p of PROYECTOS) {
    const etapa = await prisma.etapa.findUniqueOrThrow({ where: { nombre: p.etapa } });
    const clienteId = clientesPorNombre.get(p.cliente);
    if (!clienteId) throw new Error(`Cliente no encontrado: ${p.cliente}`);

    const proyecto = await findOrCreateProyecto(p.nombre, clienteId, etapa.id);

    const estadosPasos = AVANCES[p.nombre];
    if (estadosPasos) {
      await iniciarEjecucionSiNoExiste(proyecto.id, estadosPasos);
    }
  }

  console.log(`Listo: ${CLIENTES.length} clientes, ${PROYECTOS.length} proyectos.`);
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
