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
// Borrador inicial de descripciones (conceptos estandar de desarrollo web),
// pendiente de revision por el equipo con el criterio real de la agencia.
const PASOS_ELEMENTOS_BASICOS = [
  {
    nombre: "Favicon",
    descripcion:
      "Ícono que representa el sitio en la pestaña del navegador, marcadores y accesos directos. Debe subirse en .ico/.png (mínimo 32x32 y 180x180 para Apple touch icon) y enlazarse en el <head>.",
  },
  {
    nombre: "Página 404",
    descripcion:
      "Vista que se muestra cuando una URL no existe. Debe mantener la identidad visual del sitio y ofrecer navegación de vuelta (menú, botón a inicio o buscador).",
  },
  {
    nombre: "Página Gracias",
    descripcion:
      "Pantalla de confirmación tras completar un formulario o conversión (contacto, compra, suscripción). Confirma que la acción se recibió y puede incluir siguientes pasos o tracking de conversión.",
  },
  {
    nombre: "Buscador",
    descripcion:
      "Campo de búsqueda interna que permite encontrar contenido por palabra clave. Debe estar accesible desde el menú o header y redirigir a la página de resultados.",
  },
  {
    nombre: "Página de resultados",
    descripcion:
      "Vista que lista los resultados devueltos por el buscador interno. Debe manejar el caso 'sin resultados' y mostrar un extracto de cada coincidencia.",
  },
  {
    nombre: "Menú de navegación activo",
    descripcion:
      "El ítem del menú correspondiente a la página actual debe reflejar visualmente que está seleccionado (color, subrayado, negrita), para que el usuario sepa dónde está.",
  },
  {
    nombre: "Menú mobile completo",
    descripcion:
      "Versión responsive del menú (hamburguesa u otro patrón) que replica todas las secciones y submenús del menú desktop, sin omitir ítems.",
  },
  {
    nombre: "Logos en todos los formatos",
    descripcion:
      "El logo del cliente debe estar disponible en todas las variantes necesarias (color, blanco, monocromo) y formatos (SVG, PNG, favicon) usados a lo largo del sitio.",
  },
  {
    nombre: "UI kit/design system",
    descripcion:
      "Conjunto documentado de componentes reutilizables (botones, tipografías, colores, espaciados) que garantiza consistencia visual entre todas las páginas.",
  },
  {
    nombre: "Interacciones",
    descripcion:
      "Estados interactivos de los elementos (hover, focus, active, disabled) definidos y aplicados de forma consistente en botones, links y campos de formulario.",
  },
  {
    nombre: "Efectos de movimiento",
    descripcion:
      "Animaciones y transiciones (scroll reveal, fade, parallax, etc.) implementadas según el diseño, cuidando performance y respetando 'prefers-reduced-motion'.",
  },
  {
    nombre: "Filtros",
    descripcion:
      "Controles que permiten acotar un listado (productos, artículos, etc.) por categoría, precio u otro criterio, actualizando los resultados sin recargar toda la página cuando sea posible.",
  },
  {
    nombre: "Mapa de navegación",
    descripcion:
      "Estructura completa de páginas y su jerarquía (sitemap), usada para verificar que todas las rutas definidas en el diseño existen y están correctamente enlazadas.",
  },
  {
    nombre: "Estandarización de íconos",
    descripcion:
      "Todos los íconos del sitio deben venir de un mismo set/librería, con el mismo grosor de trazo y tamaño base, para mantener consistencia visual.",
  },
];

const ESTADOS_ELEMENTOS_BASICOS = ["Pendiente", "En curso", "Completo", "No aplica"];

// Seguridad WordPress (roadmap #4.2): el roadmap da el conteo real (~55 items
// del xlsx interno) y 5 categorias, pero el contenido real vive en un xlsx
// que todavia no se migro a este repo. Este es un BORRADOR de hardening
// estandar de WordPress (practica de industria, no el contenido real del
// xlsx) para que el protocolo no quede vacio mientras se hace la migracion
// real — reemplazar por el contenido del xlsx cuando este disponible.
const PASOS_SEGURIDAD_WORDPRESS = [
  // Header de seguridad
  {
    nombre: "Content-Security-Policy configurado",
    descripcion: "Header que restringe desde donde puede cargar scripts, estilos e imagenes el sitio, mitigando XSS.",
  },
  {
    nombre: "X-Frame-Options / frame-ancestors configurado",
    descripcion: "Evita que el sitio se embeba en un iframe de otro dominio (proteccion contra clickjacking).",
  },
  {
    nombre: "X-Content-Type-Options: nosniff",
    descripcion: "Evita que el navegador reinterprete el tipo de contenido de un archivo distinto al declarado.",
  },
  {
    nombre: "Strict-Transport-Security (HSTS) habilitado",
    descripcion: "Fuerza que el navegador solo se conecte al sitio por HTTPS, incluso si el usuario escribe http://.",
  },
  {
    nombre: "Referrer-Policy configurado",
    descripcion: "Controla cuanta informacion de la URL de origen se envia al navegar a otro sitio.",
  },
  // Restringir acceso a archivos
  {
    nombre: "wp-config.php con permisos restringidos",
    descripcion: "Permisos de archivo minimos (idealmente 440/400) dado que contiene credenciales de la base de datos.",
  },
  {
    nombre: "Acceso directo a PHP en wp-content/uploads bloqueado",
    descripcion: "Evita ejecutar scripts subidos como archivos (ej. via una vulnerabilidad de upload) desde la carpeta de medios.",
  },
  {
    nombre: "Listado de directorios deshabilitado",
    descripcion: "Evita que se pueda navegar el contenido de una carpeta del servidor si no tiene un index.",
  },
  {
    nombre: "xmlrpc.php restringido o deshabilitado",
    descripcion: "Vector comun de fuerza bruta y ataques de amplificacion si no se usa (ej. no hay app movil ni Jetpack).",
  },
  {
    nombre: "Backups y logs excluidos del directorio publico",
    descripcion: "Archivos .sql, .log, .zip de respaldo no deben quedar accesibles por URL directa.",
  },
  // Autenticacion y control de acceso
  {
    nombre: "Usuario admin por defecto eliminado o renombrado",
    descripcion: "El username 'admin' es el primer intento de cualquier ataque de fuerza bruta.",
  },
  {
    nombre: "Autenticacion de dos factores para administradores",
    descripcion: "2FA obligatorio al menos para roles Administrador/Editor.",
  },
  {
    nombre: "Limite de intentos de login",
    descripcion: "Bloqueo temporal o captcha tras N intentos fallidos, contra ataques de fuerza bruta.",
  },
  {
    nombre: "Politica de contrasenas fuertes",
    descripcion: "Minimo de longitud/complejidad aplicado a todos los usuarios con acceso al panel.",
  },
  {
    nombre: "Roles y permisos revisados",
    descripcion: "Cada usuario tiene el minimo privilegio necesario para su funcion (principio de minimo privilegio).",
  },
  // Validacion y sanitizacion
  {
    nombre: "Formularios con validacion y sanitizacion de inputs",
    descripcion: "Todo input de usuario (formularios de contacto, comentarios, etc.) se valida y sanitiza antes de procesarse.",
  },
  {
    nombre: "Proteccion CSRF (nonces) verificada",
    descripcion: "Formularios y acciones que modifican datos usan nonces de WordPress para evitar solicitudes falsificadas.",
  },
  {
    nombre: "Subida de archivos restringida por tipo y tamano",
    descripcion: "Los formularios de upload solo aceptan extensiones/tamanos esperados, no ejecutables.",
  },
  {
    nombre: "Consultas a base de datos parametrizadas",
    descripcion: "Cualquier query custom usa $wpdb->prepare() o el ORM, nunca concatenacion directa de strings (SQL injection).",
  },
  // Escaneos y pruebas
  {
    nombre: "Escaneo de malware/vulnerabilidades ejecutado",
    descripcion: "Escaneo con una herramienta reconocida (ej. Wordfence, Sucuri) antes de pasar a produccion.",
  },
  {
    nombre: "Plugins y tema actualizados a su ultima version estable",
    descripcion: "Sin actualizaciones pendientes al momento del gate de produccion.",
  },
  {
    nombre: "Plugins/temas sin uso desactivados y eliminados",
    descripcion: "Codigo no usado sigue siendo superficie de ataque aunque este desactivado (eliminar, no solo desactivar).",
  },
  {
    nombre: "Checklist OWASP revisado",
    descripcion: "Revision cruzada contra el OWASP Top 10 / WordPress hardening guide antes del gate de produccion.",
  },
  {
    nombre: "Respaldo completo verificado antes de publicar",
    descripcion: "Backup de base de datos y archivos tomado y restaurable, antes de aplicar cualquier cambio de produccion.",
  },
];

const ESTADOS_SEGURIDAD_WORDPRESS = ["Implementado", "Pendiente", "No aplica"];

// Creacion de ambientes (roadmap #4, prioridad #2). Borrador basado en el gate
// de la etapa 2 — Preparacion tecnica: "Repo creado, ambientes solicitados/
// creados, accesos entregados, flujo Git y CI/CD definidos".
const PASOS_CREACION_AMBIENTES = [
  {
    nombre: "Repositorio creado",
    descripcion: "Repo Git creado con nombre y visibilidad correctos, README inicial y rama principal protegida.",
  },
  {
    nombre: "Ambiente de desarrollo solicitado/creado",
    descripcion: "Entorno donde el equipo desarrolla dia a dia, con datos de prueba.",
  },
  {
    nombre: "Ambiente de staging solicitado/creado",
    descripcion: "Entorno espejo de produccion para validar antes de publicar cambios reales.",
  },
  {
    nombre: "Ambiente de produccion solicitado/creado",
    descripcion: "Entorno final visible para el cliente/usuarios finales.",
  },
  {
    nombre: "Variables de entorno configuradas por ambiente",
    descripcion: "Credenciales y configuracion (API keys, URLs, feature flags) separadas por ambiente, nunca hardcodeadas.",
  },
  {
    nombre: "Accesos entregados al equipo",
    descripcion: "Repo, hosting, DNS y demas servicios con los accesos correctos entregados a quienes correspondan.",
  },
  {
    nombre: "Flujo de ramas (Git) definido",
    descripcion: "Convencion de branching acordada (ej. main/develop/feature) y comunicada al equipo.",
  },
  {
    nombre: "Pipeline CI/CD configurado",
    descripcion: "Build, tests y deploy automatizados al menos para el ambiente de staging/produccion.",
  },
  {
    nombre: "Dominio/subdominio apuntado",
    descripcion: "DNS del proyecto apuntando al ambiente correspondiente.",
  },
  {
    nombre: "Certificado SSL activo",
    descripcion: "HTTPS funcionando en todos los ambientes accesibles publicamente.",
  },
  {
    nombre: "Backups automaticos configurados",
    descripcion: "Respaldo periodico de base de datos y archivos en produccion, con politica de retencion clara.",
  },
  {
    nombre: "Monitoreo/logs basicos habilitados",
    descripcion: "Logs de aplicacion y alguna forma de alerta ante caidas o errores criticos.",
  },
];

const ESTADOS_CREACION_AMBIENTES = ["Pendiente", "En curso", "Completo", "No aplica"];

// Cookies y proteccion de datos (roadmap #4). Checklist estructural: los
// pasos indican QUE hay que verificar, no dan el contenido legal en si — el
// paso final requiere validacion de alguien con competencia legal real
// (ver roadmap #9: "la plataforma solo impide implementar sin evaluacion,
// no reemplaza el criterio legal").
const PASOS_COOKIES_DATOS = [
  {
    nombre: "Inventario de cookies y proveedores de terceros",
    descripcion: "Listado completo de cookies que setea el sitio, incluyendo las de scripts de terceros (analytics, ads, chat, etc.).",
  },
  {
    nombre: "Clasificacion de cookies",
    descripcion: "Cada cookie categorizada (necesarias / preferencias / estadisticas / marketing) segun su proposito real.",
  },
  {
    nombre: "Banner de consentimiento implementado",
    descripcion: "El sitio pide consentimiento antes de setear cookies no esenciales, no despues.",
  },
  {
    nombre: "Politica de privacidad publicada y enlazada",
    descripcion: "Documento accesible desde el sitio, coherente con el inventario de cookies real (no una plantilla generica desactualizada).",
  },
  {
    nombre: "Mecanismo para rechazar o revocar consentimiento",
    descripcion: "El usuario puede rechazar cookies no esenciales o cambiar su eleccion despues, tan facil como aceptar.",
  },
  {
    nombre: "Validacion legal final",
    descripcion: "Revision y aprobacion por el rol Legal antes de considerar el protocolo completo — este paso no lo puede cerrar un perfil tecnico.",
  },
];

const ESTADOS_COOKIES_DATOS = ["Pendiente", "En curso", "Completo", "No aplica"];

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
      "Etapa del ciclo de vida donde aplica: 6 — Paso a producción (gate obligatorio); revisión parcial también en etapa 4 — Desarrollo. Borrador de hardening estandar de industria — reemplazar por el contenido real del xlsx cuando se migre.",
    pasos: PASOS_SEGURIDAD_WORDPRESS,
    estados: ESTADOS_SEGURIDAD_WORDPRESS,
  });

  await seedProtocolo({
    nombre: "Creación de ambientes",
    objetivo:
      "Verificar que el proyecto tiene repo, ambientes, accesos y CI/CD listos antes de avanzar a Desarrollo.",
    alcance:
      "Etapa del ciclo de vida donde aplica: 2 — Preparación técnica (gate bloqueante para iniciar Desarrollo). Borrador propio, no viene de un documento previo.",
    pasos: PASOS_CREACION_AMBIENTES,
    estados: ESTADOS_CREACION_AMBIENTES,
  });

  await seedProtocolo({
    nombre: "Cookies y protección de datos",
    objetivo:
      "Verificar que el sitio informa y gestiona correctamente las cookies y datos personales que recolecta, con validación legal final.",
    alcance:
      "Aplica transversalmente, con validación final antes de la etapa 6 — Paso a producción. Checklist estructural: no reemplaza el criterio de Legal.",
    pasos: PASOS_COOKIES_DATOS,
    estados: ESTADOS_COOKIES_DATOS,
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
