import { PrismaClient, type Prisma } from "../app/generated/prisma/client";

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

// Las 8 etapas oficiales del ciclo de vida (roadmap #1). Catalogo fijo, no hay
// UI para agregar/editar etapas en el spec de Protocolos.
const ETAPAS = [
  {
    orden: 0,
    nombre: "Preinicio",
    gateDescripcion:
      "Alcance y presupuesto aprobados, responsable interno asignado, contactos del cliente registrados",
  },
  {
    orden: 1,
    nombre: "Kickoff",
    gateDescripcion:
      "Objetivos, alcance, canales, responsables e hitos definidos y confirmados por escrito",
  },
  {
    orden: 2,
    nombre: "Preparación técnica",
    gateDescripcion:
      "Repo creado, ambientes solicitados/creados, accesos entregados, flujo Git y CI/CD definidos",
  },
  {
    orden: 3,
    nombre: "Diseño / definición funcional",
    gateDescripcion: "Wireframes o diseño aprobado por el cliente",
  },
  {
    orden: 4,
    nombre: "Desarrollo",
    gateDescripcion:
      "Repo, ambiente y alcance aprobado existen (bloqueante — no puede iniciar sin esto)",
  },
  {
    orden: 5,
    nombre: "QA",
    gateDescripcion: "Funcional, responsive, seguridad y rendimiento validados",
  },
  {
    orden: 6,
    nombre: "Paso a producción",
    gateDescripcion:
      "Respaldo hecho, plan de rollback definido, checklist de producción cerrado",
  },
  {
    orden: 7,
    nombre: "Entrega y cierre",
    gateDescripcion:
      "Accesos y documentación entregados, aceptación del cliente registrada",
  },
];

// Pasos de "Elementos básicos de sitio web" (roadmap #4.1), transcritos tal
// cual del roadmap — contenido real, no un placeholder.
const PASOS_ELEMENTOS_BASICOS = [
  "Favicon",
  "Página 404",
  "Página Gracias",
  "Buscador",
  "Página de resultados",
  "Menú de navegación activo",
  "Menú mobile completo",
  "Logos en todos los formatos",
  "UI kit/design system",
  "Interacciones",
  "Efectos de movimiento",
  "Filtros",
  "Mapa de navegación",
  "Estandarización de íconos",
].map((nombre) => ({ nombre }));

const ESTADOS_ELEMENTOS_BASICOS = ["Pendiente", "En curso", "Completo", "No aplica"];

// Seguridad WordPress (roadmap #4.2): el roadmap solo da el conteo (~55) y las
// 5 categorías, el contenido real vive en un xlsx que todavia no se migro a
// este repo. pasos_json queda vacio a proposito — se completa cuando se migre
// el xlsx, sin cambios de schema (ver spec de Protocolos, "fuera de alcance").
const PASOS_SEGURIDAD_WORDPRESS: Prisma.InputJsonValue[] = [];

const ESTADOS_SEGURIDAD_WORDPRESS = ["Implementado", "Pendiente", "No aplica"];

async function seedRoles() {
  for (const nombre of ROLES) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
}

async function seedEtapas() {
  for (const etapa of ETAPAS) {
    await prisma.etapa.upsert({
      where: { nombre: etapa.nombre },
      update: { orden: etapa.orden, gateDescripcion: etapa.gateDescripcion },
      create: etapa,
    });
  }
}

async function seedProtocolo(params: {
  nombre: string;
  objetivo: string;
  alcance: string;
  pasos: Prisma.InputJsonValue[];
  estados: string[];
}) {
  const protocolo = await prisma.protocolo.upsert({
    where: { nombre: params.nombre },
    update: { objetivo: params.objetivo, alcance: params.alcance },
    create: {
      nombre: params.nombre,
      objetivo: params.objetivo,
      alcance: params.alcance,
    },
  });

  await prisma.versionProtocolo.upsert({
    where: {
      protocoloId_numeroVersion: { protocoloId: protocolo.id, numeroVersion: 1 },
    },
    update: { pasosJson: params.pasos, estadosJson: params.estados },
    create: {
      protocoloId: protocolo.id,
      numeroVersion: 1,
      pasosJson: params.pasos,
      estadosJson: params.estados,
    },
  });
}

async function seedProtocolos() {
  await seedProtocolo({
    nombre: "Elementos básicos de sitio web",
    objetivo:
      "Verificar que el proyecto cubre los elementos basicos esperados en cualquier sitio web antes de cerrar la etapa de diseño/definición funcional.",
    alcance: "Etapa del ciclo de vida donde aplica: 3 — Diseño / definición funcional.",
    pasos: PASOS_ELEMENTOS_BASICOS,
    estados: ESTADOS_ELEMENTOS_BASICOS,
  });

  await seedProtocolo({
    nombre: "Seguridad WordPress",
    objetivo:
      "Validar el hardening de seguridad de un sitio WordPress antes de pasar a producción.",
    alcance:
      "Etapa del ciclo de vida donde aplica: 6 — Paso a producción (gate obligatorio); revisión parcial también en etapa 4 — Desarrollo. Pasos pendientes de migrar desde el xlsx existente.",
    pasos: PASOS_SEGURIDAD_WORDPRESS,
    estados: ESTADOS_SEGURIDAD_WORDPRESS,
  });
}

async function main() {
  await seedRoles();
  await seedEtapas();
  await seedProtocolos();
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
