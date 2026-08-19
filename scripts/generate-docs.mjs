/**
 * Genera los PDF corporativos en docs/ con la paleta ROSE y el kit de public/brand/.
 * Uso: npm run docs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const BRAND = path.join(ROOT, "public", "brand");

const RED = "#e10600";
const MUTED = "#8f3a36";
const INK = "#1a1414";
const GRAY = "#5c524f";
const BLACK = "#070707";
const WHITE = "#ffffff";
const MM = 2.834645669;
const MARGIN = 24 * MM;
const HEADER_H = 16 * MM;
const FOOTER_H = 14 * MM;

const logoBlanco = path.join(BRAND, "logo-mark.png");
const logoRojo = path.join(BRAND, "logo-hero.png");
const mark = fs.existsSync(logoRojo) ? logoRojo : logoBlanco;

fs.mkdirSync(DOCS, { recursive: true });

function openDoc(filename) {
  const out = path.join(DOCS, filename);
  const doc = new PDFDocument({
    size: "A4",
    bufferPages: true,
    margins: {
      top: MARGIN + 6,
      bottom: MARGIN + 4,
      left: MARGIN,
      right: MARGIN,
    },
    info: {
      Author: "ROSE S.A.S.",
      Creator: "ROSE Technology",
      Producer: "ROSE Technology docs",
    },
  });
  const stream = fs.createWriteStream(out);
  doc.pipe(stream);
  return { doc, stream, out };
}

function drawWatermark(doc) {
  const src = fs.existsSync(logoBlanco) ? logoBlanco : mark;
  if (!fs.existsSync(src)) return;
  doc.save();
  const size = Math.min(168, doc.page.width * 0.38, doc.page.height * 0.28);
  const x = (doc.page.width - size) / 2;
  const y = (doc.page.height - size) / 2;
  doc.opacity(0.05);
  try {
    doc.image(src, x, y, { fit: [size, size], align: "center", valign: "center" });
  } catch {
    /* PNG no soportado en este entorno */
  }
  doc.restore();
}

/** Chrome/watermark sit in the margin band; disable auto page-breaks so they cannot spawn empty pages. */
function withoutPageBreaks(doc, fn) {
  const page = doc.page;
  const saved = {
    top: page.margins.top,
    bottom: page.margins.bottom,
    left: page.margins.left,
    right: page.margins.right,
  };
  page.margins.top = 0;
  page.margins.bottom = 0;
  page.margins.left = 0;
  page.margins.right = 0;
  try {
    fn();
  } finally {
    page.margins.top = saved.top;
    page.margins.bottom = saved.bottom;
    page.margins.left = saved.left;
    page.margins.right = saved.right;
  }
}

function drawChrome(doc, subtitle, page, total) {
  const w = doc.page.width;
  const h = doc.page.height;

  doc.save();
  doc.rect(0, 0, w, HEADER_H).fill(BLACK);
  doc.rect(0, HEADER_H - 2.2, w, 2.2).fill(RED);

  const logo = fs.existsSync(logoBlanco) ? logoBlanco : null;
  if (logo) {
    try {
      doc.image(logo, MARGIN, 4.2 * MM, { height: 8.2 * MM });
    } catch {
      /* ignore */
    }
  }
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text("ROSE S.A.S.  ·  ROSE Technology", MARGIN + 16 * MM, 5 * MM, {
    width: w - MARGIN * 2 - 16 * MM,
    align: "right",
  });
  doc.fillColor("#c9b8b6").font("Helvetica").fontSize(7);
  doc.text(subtitle, MARGIN + 16 * MM, 9 * MM, {
    width: w - MARGIN * 2 - 16 * MM,
    align: "right",
  });

  doc.rect(0, h - FOOTER_H, w, FOOTER_H).fill(BLACK);
  doc.rect(0, h - FOOTER_H, w, 2).fill(RED);
  doc.fillColor("#c9b8b6").font("Helvetica").fontSize(7);
  doc.text(
    "Uso interno / confidencial  ·  ROSE S.A.S.  ·  Villavicencio, Meta",
    MARGIN,
    h - FOOTER_H + 4.2 * MM,
    { width: w - MARGIN * 2 - 28 * MM, align: "left" },
  );
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
  doc.text(`${page} / ${total}`, MARGIN, h - FOOTER_H + 4 * MM, {
    width: w - MARGIN * 2,
    align: "right",
  });
  doc.restore();
}

function finish(doc, subtitle) {
  const range = doc.bufferedPageRange();
  const total = range.count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(range.start + i);
    withoutPageBreaks(doc, () => {
      drawWatermark(doc);
      drawChrome(doc, subtitle, i + 1, total);
    });
  }
  doc.end();
}

function h1(doc, text) {
  doc.moveDown(0.35);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(16).text(text, { lineGap: 2 });
  doc.moveDown(0.15);
  const y = doc.y;
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + 42, y).lineWidth(2).strokeColor(RED).stroke();
  doc.moveDown(0.55);
}

function h2(doc, text) {
  ensureSpace(doc, 72);
  doc.moveDown(0.35);
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(11.5).text(text, { lineGap: 1 });
  doc.moveDown(0.25);
}

function para(doc, text) {
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, {
    align: "justify",
    lineGap: 2.2,
  });
  doc.moveDown(0.38);
}

function bullets(doc, items) {
  for (const item of items) {
    ensureSpace(doc, 36);
    doc.fillColor(INK).font("Helvetica").fontSize(10).text(`•   ${item}`, {
      indent: 6,
      lineGap: 1.6,
    });
  }
  doc.moveDown(0.28);
}

function note(doc, text) {
  ensureSpace(doc, 48);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;
  doc.save();
  doc.rect(x, y, 3, 28).fill(RED);
  doc.restore();
  doc.fillColor(MUTED).font("Helvetica-Oblique").fontSize(9).text(text, x + 10, y, {
    width: width - 10,
    lineGap: 1.5,
  });
  doc.moveDown(0.6);
}

function ensureSpace(doc, need) {
  const limit = doc.page.height - doc.page.margins.bottom - 8;
  if (doc.y + need > limit) doc.addPage();
}

/** Start the next heading on a new page; skip if already at the top (no blank pages). */
function pageBreakBefore(doc) {
  if (doc.y > doc.page.margins.top + 1) doc.addPage();
}

function kvTable(doc, rows) {
  const left = doc.page.margins.left;
  const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const col1 = usable * 0.34;
  for (const [k, v] of rows) {
    ensureSpace(doc, 28);
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(BLACK).text(k, left, y, { width: col1 });
    doc.font("Helvetica").fontSize(9).fillColor(INK).text(v, left + col1, y, { width: usable - col1 });
    doc.moveDown(0.35);
  }
  doc.moveDown(0.2);
}

function cover(doc, { kicker, title, subtitle, date }) {
  const left = doc.page.margins.left;
  doc.moveDown(1.6);
  if (fs.existsSync(logoRojo)) {
    try {
      const y = doc.y;
      doc.image(logoRojo, left, y, { fit: [110, 52], align: "left", valign: "center" });
      doc.y = y + 58;
    } catch {
      /* ignore */
    }
  }
  doc.moveDown(0.85);
  doc.fillColor(RED).font("Helvetica-Bold").fontSize(9).text(kicker.toUpperCase(), { characterSpacing: 1.4 });
  doc.moveDown(0.35);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(22).text(title, { lineGap: 4 });
  doc.moveDown(0.35);
  doc.fillColor(GRAY).font("Helvetica").fontSize(11).text(subtitle, { lineGap: 3 });
  doc.moveDown(1.1);
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(date);
  doc.moveDown(0.2);
  doc.fillColor(GRAY).font("Helvetica").fontSize(9).text("Villavicencio, Meta, Colombia");
}

function waitEnd(stream) {
  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function technicalPdf() {
  const { doc, stream, out } = openDoc("ROSE-documentacion-tecnica.pdf");
  doc.info.Title = "ROSE Technology — Documentación técnica";

  cover(doc, {
    kicker: "Documentación técnica",
    title: "Sitio corporativo ROSE Technology",
    subtitle:
      "Arquitectura, operación, internacionalización, mapas, correo y controles de seguridad del sitio institucional de ROSE S.A.S.",
    date: "19 de agosto de 2026",
  });

  doc.addPage();
  h1(doc, "1.  Propósito");
  para(
    doc,
    "Este documento describe el sitio web institucional de ROSE S.A.S. (marca comercial ROSE Technology): un centro de reparación y optimización de sistemas empresariales con sede en Villavicencio, Meta. El producto digital comunica la oferta de servicio técnico, el software administrativo Myshop, el catálogo de productos, la cobertura territorial y un canal de contacto que notifica al equipo comercial por correo electrónico.",
  );
  para(
    doc,
    "No sustituye el código fuente. Su objetivo es que un desarrollador, un auditor o un directivo comprendan cómo está montado el sistema, qué se puede configurar y qué decisiones de seguridad están tomadas.",
  );

  h2(doc, "1.1  Alcance");
  bullets(doc, [
    "Frontend estático generado con Vite (React 19 y TypeScript).",
    "API Express de un solo propósito: recepción y reenvío de leads.",
    "Integración con Resend para el correo transaccional.",
    "Mapas de sede y de cobertura (Google Maps, con fallback a iframe).",
    "Kit de marca servido desde public/brand/ (Vite copia esos archivos a dist/brand/).",
  ]);

  h1(doc, "2.  Arquitectura");
  para(
    doc,
    "La arquitectura es deliberadamente simple: un cliente de una sola página y un servicio HTTP. En desarrollo, Vite hace de proxy: cualquier petición a /api se reenvía a Express en 127.0.0.1:8787. En producción un solo proceso Node (server/index.mjs) sirve dist/ y POST /api/contact, escuchando en PORT (Render/Docker).",
  );
  bullets(doc, [
    "Navegador → Vite (dev) o el mismo Node que sirve dist/ (prod) → React.",
    "POST /api/contact → Express → validación → Resend → CEO y visitante.",
    "GET /api/health → comprobación de vida, sin datos personales.",
    "Los mapas se cargan desde Google si existe VITE_GOOGLE_MAPS_KEY; si no, iframe embebido.",
  ]);
  note(
    doc,
    "La clave de Resend nunca viaja al cliente. Cualquier variable con prefijo VITE_ queda incrustada en el JavaScript del navegador.",
  );

  h1(doc, "3.  Stack técnico");
  kvTable(doc, [
    ["Interfaz", "Vite 7, React 19, TypeScript 5.9"],
    ["Estilos", "CSS propio, paleta negro / blanco / #e10600"],
    ["API", "Express 5 (ESM, Node)"],
    ["Correo", "Resend SDK, plantillas HTML escapadas"],
    ["Seguridad API", "Helmet, CORS con allowlist, express-rate-limit"],
    ["Mapas", "Maps JavaScript API o Maps Embed"],
    ["i18n", "JSON por idioma + I18nProvider"],
    ["Marca", "PNG/SVG en public/brand/ (runtime y PDF)"],
  ]);

  pageBreakBefore(doc);
  h1(doc, "4.  Secciones y funciones del sitio");
  para(doc, "El contenido se organiza en anclas de una sola página, con navegación fija y menú móvil.");
  bullets(doc, [
    "Inicio: promesa de marca, llamados a diagnóstico, Myshop y folleto PDF.",
    "Quiénes somos: posicionamiento de ROSE S.A.S. en Villavicencio.",
    "Servicios: reparación y mantenimiento de equipos (torres, portátiles, impresoras, móviles).",
    "Software: Myshop, sistema administrativo con enlace al producto en línea.",
    "Productos: oferta de hardware y accesorios para empresas y pymes.",
    "Por qué ROSE: argumentos de confianza, horario y cobertura.",
    "Equipo: presentación del personal de atención.",
    "Cobertura: mapa presencial (cabeceras urbanas del Meta) y remoto (departamento).",
    "Contacto: datos de sede, WhatsApp, correo y formulario con temas cerrados.",
  ]);
  para(
    doc,
    "El pie incluye datos de Cra. 39 #10 51, Esperanza, y accesos a WhatsApp. Un aviso de cookies local (sin rastreador de terceros) registra el consentimiento en localStorage. Hay JSON-LD de LocalBusiness generado con datos de compañía, no con entrada de usuario.",
  );

  h1(doc, "5.  Internacionalización");
  para(
    doc,
    "Nueve idiomas: español (predeterminado), inglés, francés, chino simplificado, portugués de Brasil, alemán, japonés, italiano y coreano. Cada archivo en src/i18n/locales/*.json cubre navegación, hero, servicios, formulario y accesibilidad. El idioma se guarda en localStorage y se refleja en el atributo lang del documento.",
  );
  para(
    doc,
    "Los temas del formulario usan identificadores estables (diagnostico, cotizacion, myshop, productos, asesoria, mantenimiento). Las etiquetas visibles se traducen; el servidor acepta el id y, como compatibilidad, la etiqueta local para mapear al id.",
  );

  h1(doc, "6.  Tema visual");
  para(
    doc,
    "El sitio ofrece tema oscuro (predeterminado corporativo) y claro. La primera visita respeta prefers-color-scheme; después prima rose-theme en localStorage. Un script mínimo en index.html aplica el tema antes del primer pintado para evitar un destello. Los mapas cambian de estilo (calles, agua, etiquetas) según el tema. Los logos de cabecera y pie alternan isotipo blanco o rojo.",
  );

  h1(doc, "7.  Mapas y cobertura");
  h2(doc, "7.1  Sede");
  para(
    doc,
    "LocationMap intenta cargar Maps JavaScript API con la clave pública restringida. Si la clave falta, Google responde error de autenticación o el script no carga, se muestra el iframe de Maps Embed apuntando a la dirección de la sede. No se exige geolocalización del visitante.",
  );
  h2(doc, "7.2  Cobertura");
  para(
    doc,
    "CoverageMap pinta polígonos GeoJSON: cabeceras urbanas de Villavicencio, Acacías, Restrepo, Cumaral, Granada, San Martín y Puerto López para el servicio presencial, y el polígono del departamento del Meta para el servicio remoto. Los datos viven en src/data/coverage.json y se regeneran con scripts/fetch-coverage.mjs a partir de OpenStreetMap (Overpass), privilegiando perímetros urbanos y no el límite rural municipal.",
  );
  note(
    doc,
    "VITE_GOOGLE_MAPS_KEY es pública por diseño. Debe restringirse por HTTP referrer (dominio de producción y, en local, localhost) y, preferiblemente, solo a Maps JavaScript API y Maps Embed API.",
  );

  h1(doc, "8.  Contacto y flujo Resend");
  para(
    doc,
    "El visitante completa nombre, correo, teléfono o WhatsApp, un tema de la lista cerrada y un mensaje. El cliente valida longitudes y formato. Un campo honeypot (website) permanece oculto; los bots que lo rellenan reciben una respuesta de éxito y el servidor no envía correo.",
  );
  bullets(doc, [
    "POST /api/contact con JSON de campos permitidos únicamente.",
    "Express vuelve a validar: longitudes, regex de correo, teléfono, allowlist de tema, locale conocida.",
    "Rate limit: 5 envíos por IP cada 15 minutos (configurable).",
    "Si RESEND_API_KEY está ausente o es un placeholder, se responde 503 con mensaje operativo.",
    "Correo interno a CEO_EMAIL con los datos del lead (HTML escapado) y el isotipo como CID.",
    "Correo de confirmación al visitante, salvo que el remitente sea @resend.dev (modo prueba).",
  ]);
  para(
    doc,
    "Los errores de Resend se traducen a mensajes genéricos (clave inválida, dominio no verificado, modo de prueba). El cliente nunca recibe la traza ni el cuerpo crudo del proveedor.",
  );

  h1(doc, "9.  Variables de entorno");
  para(
    doc,
    "La fuente de verdad de nombres y propósito es .env.example. El archivo .env de la raíz no se versiona. No debe existir src/.env con secretos: Vite expondría cualquier VITE_*.",
  );
  kvTable(doc, [
    ["RESEND_API_KEY", "Secreto de correo. Solo servidor."],
    ["RESEND_FROM", "Remitente; dominio verificado en producción."],
    ["CEO_EMAIL", "Bandeja interna de leads."],
    ["PORT / API_PORT", "Bind HTTP. PORT lo exige Render; local 8787."],
    ["API_HOST", "0.0.0.0 en Docker/producción; 127.0.0.1 en local."],
    ["FRONTEND_ORIGIN", "Orígenes CORS extra, separados por coma."],
    ["RATE_LIMIT_*", "Ventana y máximo de POST /api/contact."],
    ["TRUST_PROXY", "1 si hay proxy inverso (IP real)."],
    ["VITE_GOOGLE_MAPS_KEY", "Clave Maps, pública; restringir referrer. Bake en build."],
    ["VITE_GOOGLE_MAPS_MAP_ID", "Map ID opcional (estilos / markers)."],
  ]);

  h1(doc, "10.  Controles de seguridad");
  bullets(doc, [
    "Helmet en la API: CSP default-src none, sin X-Powered-By, referrer estricto.",
    "CORS allowlist: localhost:5173, :4173 y FRONTEND_ORIGIN.",
    "Cuerpo JSON/urlencoded limitado a 16 KB.",
    "Rechazo de claves JSON no declaradas.",
    "Honeypot website.",
    "Sin stack traces hacia el cliente; logs de producción sin PII.",
    "CSP y referrer en index.html; cabeceras equivalentes en el servidor de Vite.",
    "El formulario no usa innerHTML con datos del usuario; los avisos son nodos de texto.",
    "JSON-LD se serializa con JSON.stringify de constantes de compañía.",
    "innerHTML vacío en los mapas solo limpia el contenedor de Google, no interpola texto de visitante.",
  ]);
  para(
    doc,
    "Detalle operativo y canal de reporte: SECURITY.md. Este PDF no incluye claves ni ejemplos de secretos reales.",
  );

  h1(doc, "11.  Cómo ejecutarlo");
  bullets(doc, [
    "Node.js 20 o superior.",
    "npm install",
    "Copiar .env.example a .env y completar valores.",
    "npm run dev — API y Vite en paralelo.",
    "npm run build — chequeo TypeScript y dist/.",
    "npm run preview — sirve dist/ con proxy a la API (desarrollo).",
    "npm start — un proceso: estáticos dist/ + /api (producción, NODE_ENV=production).",
    "npm run docs — regenera este PDF, el reporte ejecutivo y el PDF de arquitectura.",
    "docker compose up --build — imagen de producción con .env en runtime.",
  ]);
  para(
    doc,
    "En producción se publica un contenedor o Node con NODE_ENV=production: sirve dist/ y la API, dominio Resend verificado, FRONTEND_ORIGIN de la URL real y la clave de Maps restringida (y presente en el build de Vite).",
  );

  h1(doc, "12.  Estructura de carpetas");
  kvTable(doc, [
    ["public/brand/", "Activos de marca que el sitio y el correo usan."],
    ["public/images/", "Fotografías de servicios."],
    ["server/", "Express + plantillas de correo."],
    ["src/", "Aplicación React (componentes, i18n, tema)."],
    ["src/data/", "GeoJSON de cobertura."],
    ["scripts/", "Cobertura OSM, generador de PDF."],
    ["docs/", "PDF locales (npm run docs). No se publican en GitHub."],
  ]);
  para(
    doc,
    "Las dependencias se instalan en node_modules/ (ignorado por Git). Las versiones exactas quedan en package-lock.json. dist/ es artefacto de build y no se versiona.",
  );

  h1(doc, "13.  Marca y documentos");
  para(
    doc,
    "El kit de marca vive en public/brand/: isotipo y bloque de héroe (logo-hero, logo-mark, marcas recortadas) e icono compacto de WhatsApp. Vite copia esa carpeta a dist/brand/ al compilar. Los correos adjuntan logo-mark-red.png desde disco.",
  );
  para(
    doc,
    "Los PDF de docs/ se generan en local con este script (pdfkit): márgenes de 24 mm, cabecera negra con filete rojo, pie confidencial con numeración y marca de agua del isotipo. Incluyen este manual, el reporte ejecutivo y ROSE-arquitectura.pdf. No se publican en GitHub.",
  );

  finish(doc, "Documentación técnica");
  return { stream, out };
}

function executivePdf() {
  const { doc, stream, out } = openDoc("ROSE-reporte-ejecutivo.pdf");
  doc.info.Title = "ROSE Technology — Reporte ejecutivo de proyecto";

  cover(doc, {
    kicker: "Reporte ejecutivo",
    title: "Entrega del sitio corporativo",
    subtitle:
      "Síntesis de lo construido: presencia digital, marca, mapas de cobertura, canal de contacto y documentación para ROSE S.A.S.",
    date: "19 de agosto de 2026",
  });

  doc.addPage();
  h1(doc, "Qué se entregó");
  para(
    doc,
    "ROSE S.A.S. cuenta con un sitio corporativo moderno, bilingüe en nueve idiomas, alineado a la identidad visual negra-blanca-roja de ROSE Technology. El visitante entiende quiénes somos, qué reparamos, cómo funciona Myshop, qué productos ofrecemos y en qué municipios del Meta hay cobertura presencial o remota. Desde el mismo sitio puede escribir al equipo; el mensaje llega por correo al responsable comercial y el visitante recibe confirmación.",
  );

  h2(doc, "Sitio");
  bullets(doc, [
    "Página única con navegación clara (inicio, servicios, software, productos, equipo, cobertura, contacto).",
    "Tema claro y oscuro, tipografías corporativas y componentes accesibles (salto al contenido, etiquetas, estados de error).",
    "Folleto comercial descargable y acceso directo a WhatsApp.",
  ]);

  h2(doc, "Marca");
  bullets(doc, [
    "Kit de marca en public/brand/ (hero, isotipos, WhatsApp) servido por el sitio.",
    "Correos de lead y confirmación usan el isotipo y la paleta #e10600.",
  ]);

  h2(doc, "Mapas");
  bullets(doc, [
    "Mapa de la sede en Esperanza, Villavicencio (API de Google o iframe si no hay clave).",
    "Mapa de cobertura: cascos urbanos del Meta para visita presencial y el departamento para soporte remoto.",
    "La clave de Maps, de ser usada, debe restringirse por dominio: es visible en el navegador por naturaleza del producto de Google.",
  ]);

  h2(doc, "Formulario");
  bullets(doc, [
    "Temas de negocio cerrados (diagnóstico, cotización, Myshop, productos, asesoría, mantenimiento).",
    "Validación en el navegador y de nuevo en el servidor.",
    "Envío vía Resend: aviso interno y confirmación al cliente, con dominio propio verificado en producción.",
  ]);

  h2(doc, "Seguridad");
  bullets(doc, [
    "La clave de correo no sale del servidor.",
    "CORS limitado al origen del sitio, límite de envíos por IP, cuerpo pequeño, campos estrictos y honeypot anti-bot.",
    "Cabeceras y política de contenido en API y frontend; errores sin detalle interno; registros de producción sin datos personales.",
  ]);

  h2(doc, "Documentación");
  bullets(doc, [
    "README.md: arranque, variables, scripts y estructura.",
    "SECURITY.md: modelo de amenazas, reporte de incidentes y lo que es público a propósito.",
    "Este reporte, la documentación técnica y el PDF de arquitectura en docs/, regenerables con npm run docs.",
  ]);

  pageBreakBefore(doc);
  h1(doc, "Cómo se opera");
  para(
    doc,
    "Un desarrollador clona el repositorio, instala dependencias, copia las variables de ejemplo y ejecuta npm run dev. Para publicar: Docker (docker compose up --build) o Render con render.yaml; un proceso sirve dist/ y /api/contact. El detalle técnico está en el PDF compañero ROSE-documentacion-tecnica.pdf.",
  );

  h1(doc, "Resultado de negocio");
  para(
    doc,
    "ROSE presenta una imagen coherente con su marca, atiende a visitantes en su idioma, muestra con claridad dónde llega el servicio y convierte consultas en correos accionables —sin exponer secretos ni abrir la API al internet sin control. El mantenimiento es acotado: un frontend estático, una API pequeña y un kit de marca versionado.",
  );
  note(doc, "Documento de uso interno. No incluye claves de API, Maps ni Resend.");

  finish(doc, "Reporte ejecutivo");
  return { stream, out };
}

function drawArchBox(doc, x, y, w, h, title, sub, fill = WHITE) {
  doc.save();
  doc.lineWidth(0.8).strokeColor(INK).fillColor(fill);
  doc.roundedRect(x, y, w, h, 3).fillAndStroke();
  doc.rect(x, y, 3.2, h).fill(RED);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(8).text(title, x + 8, y + 6, {
    width: w - 12,
    align: "left",
  });
  doc.fillColor(GRAY).font("Helvetica").fontSize(7).text(sub, x + 8, y + 18, {
    width: w - 12,
    align: "left",
    lineGap: 1,
  });
  doc.restore();
}

function drawVLine(doc, x, y1, y2) {
  doc.save();
  doc.strokeColor(RED).lineWidth(1.1).moveTo(x, y1).lineTo(x, y2).stroke();
  doc.restore();
}

function architecturePdf() {
  const { doc, stream, out } = openDoc("ROSE-arquitectura.pdf");
  doc.info.Title = "ROSE Technology — Arquitectura del sistema";

  cover(doc, {
    kicker: "Arquitectura de sistema",
    title: "Arquitectura del sitio corporativo",
    subtitle:
      "Decisiones de diseño, distribución local y de producción, infraestructura y flujo de datos de ROSE Technology (ROSE S.A.S.).",
    date: "19 de agosto de 2026",
  });

  doc.addPage();
  h1(doc, "1.  Propósito de este documento");
  para(
    doc,
    "Este PDF explica la arquitectura elegida para el sitio institucional de ROSE S.A.S.: qué piezas hay, para qué sirve cada una y por qué se montó así y no como un CMS, un backend con base de datos o varios microservicios. Complementa la documentación técnica (detalle operativo) y el reporte ejecutivo (síntesis de negocio). En GitHub, el mismo contenido vive en ARCHITECTURE.md; este archivo en docs/ es solo local.",
  );
  para(
    doc,
    "El producto es un folleto digital: comunica marca, servicios, Myshop, productos y cobertura, y convierte una consulta en un correo. No hay cuentas de usuario, pasarela de pago ni persistencia propia de leads.",
  );

  h1(doc, "2.  Arquitectura elegida");
  para(
    doc,
    "Una aplicación de una sola página (SPA) en Vite, React 19 y TypeScript, más una API Express mínima en el mismo runtime de Node. En desarrollo son dos procesos unidos por un proxy. En producción (Docker / Render) un solo proceso Node sirve los estáticos de dist/ y POST /api/contact.",
  );
  bullets(doc, [
    "Frontend: Vite 7, React 19, TypeScript 5.9, CSS propio (paleta negro / blanco / #e10600).",
    "API: Express 5 (ESM) en server/index.mjs — contacto, salud y, en producción, archivos estáticos.",
    "Correo: Resend (SDK en el servidor; la clave nunca llega al navegador).",
    "Mapas: Google Maps JavaScript API o iframe Embed si falta la clave pública.",
    "Empaquetado: imagen Docker de dos etapas (build Vite + runner Node 20 Alpine).",
    "Alojamiento: Render, plan gratuito, runtime Docker según render.yaml.",
  ]);

  ensureSpace(doc, 196);
  doc.moveDown(0.2);
  const left = doc.page.margins.left;
  const usable = doc.page.width - left - doc.page.margins.right;
  const col = (usable - 12) / 2;
  let y = doc.y;
  drawArchBox(doc, left, y, usable, 36, "Visitante (navegador)", "SPA React, i18n, tema, mapas y formulario", WHITE);
  drawVLine(doc, left + usable / 2, y + 36, y + 46);
  y += 46;
  drawArchBox(
    doc,
    left,
    y,
    col,
    44,
    "Capa de entrega",
    "Dev: Vite :5173 + proxy /api. Prod: Express sirve dist/ y escucha PORT.",
    WHITE,
  );
  drawArchBox(doc, left + col + 12, y, col, 44, "API Express", "POST /api/contact · GET /api/health · Helmet, CORS, rate limit", WHITE);
  drawVLine(doc, left + col / 2, y + 44, y + 54);
  drawVLine(doc, left + col + 12 + col / 2, y + 44, y + 54);
  y += 54;
  drawArchBox(doc, left, y, col, 40, "Google Maps", "Clave VITE_* en el bundle. Restringir por HTTP referrer.", WHITE);
  drawArchBox(doc, left + col + 12, y, col, 40, "Resend", "Lead a CEO_EMAIL y confirmación al visitante. Secreto solo en Node.", WHITE);
  doc.y = y + 48;
  doc.moveDown(0.35);
  note(
    doc,
    "En producción el origen del sitio y el de la API coinciden: el formulario llama a /api/contact en el mismo host. CORS extra (FRONTEND_ORIGIN) cubre el caso en que el origen publicado no sea localhost.",
  );

  h1(doc, "3.  Por qué estas decisiones");
  h2(doc, "3.1  Un folleto corporativo, no una plataforma");
  para(
    doc,
    "El sitio no gestiona inventario, citas ni usuarios. El valor está en la presencia de marca y en un canal de leads. Un SPA estático más un endpoint de correo cubre ese alcance con poco mantenimiento: sin esquema de base de datos, sin migraciones y sin un segundo servicio que vigilar.",
  );

  h2(doc, "3.2  Una sola unidad de despliegue");
  para(
    doc,
    "Vite por un lado y Express por otro complican CORS, cookies, salud y facturación en un host gratuito. Un proceso Node que sirve dist/ y /api permite un contenedor, un PORT (el que asigna Render) y una URL. Localmente se mantiene la experiencia de recarga rápida: npm run dev levanta API y Vite en paralelo y el proxy reenvía /api a 127.0.0.1:8787.",
  );

  h2(doc, "3.3  Resend y Maps imponen el corte cliente / servidor");
  para(
    doc,
    "La clave de Resend es un secreto: si viajara al cliente (por ejemplo con prefijo VITE_), cualquiera podría enviar correo con la cuota de ROSE. Por eso vive solo en el proceso Node. La clave de Google Maps, en cambio, es pública por diseño del producto de Google: Vite la incrusta en el JavaScript. La defensa no es ocultarla, sino restringirla por HTTP referrer y por API (Maps JavaScript y Maps Embed).",
  );

  h2(doc, "3.4  Sin base de datos adicional");
  para(
    doc,
    "Los leads no se guardan en Postgres ni en un CRM propio: llegan a la bandeja CEO_EMAIL y el visitante recibe confirmación. El idioma y el tema viven en localStorage. Los polígonos de cobertura son JSON versionado (src/data/coverage.json). Añadir una base habría significado backups, contraseñas, plan de pago en Render y superficie de ataque sin beneficio de negocio en esta fase.",
  );

  h2(doc, "3.5  Docker y Render (plan free)");
  para(
    doc,
    "La imagen de dos etapas deja fuera compiladores y pdfkit del runtime. Render construye esa imagen, inyecta secretos en el panel (sync: false en el blueprint) y comprueba GET /api/health. El plan gratuito encaja con un sitio institucional de tráfico moderado; el proceso se duerme con inactividad, lo aceptable para un folleto, no para un API crítica 24/7.",
  );

  pageBreakBefore(doc);
  h1(doc, "4.  Qué hace cada parte");
  kvTable(doc, [
    ["Frontend (src/)", "SPA: secciones ancla, navegación fija y menú móvil, formularios y mapas."],
    ["API /api/contact", "Único flujo de negocio: validar el lead y disparar Resend."],
    ["API /api/health", "Comprobación de vida para Docker/Render, sin datos personales."],
    ["Resend", "Correo interno (lead) y confirmación al visitante, HTML escapado."],
    ["Google Maps", "Sede (LocationMap) y cobertura (CoverageMap + GeoJSON)."],
    ["i18n", "Nueve locales JSON + I18nProvider; lang del documento y localStorage."],
    ["Tema", "Claro/oscuro (ThemeProvider), prefers-color-scheme y rose-theme."],
    ["Marca (public/brand/)", "Logos del sitio, pie, PDF y adjunto CID del correo."],
  ]);
  para(
    doc,
    "El frontend no habla con Resend ni con Overpass en el navegador. Overpass solo se usa en scripts/fetch-coverage.mjs, en máquina de desarrollo, para regenerar el GeoJSON. El visitante nunca envía su ubicación: los mapas no piden geolocalización.",
  );

  h2(doc, "4.1  Frontend");
  para(
    doc,
    "React monta una página con anclas (#inicio, servicios, software, productos, equipo, cobertura, contacto). Header gestiona el menú de escritorio y el cajón móvil (bloqueo de scroll). ContactForm valida en el cliente y hace POST JSON. LocationMap carga el script de Maps si hay VITE_GOOGLE_MAPS_KEY; si falla, usa el iframe. CoverageMap pinta polígonos urbanos del Meta y el departamento para servicio remoto.",
  );

  h2(doc, "4.2  API de contacto");
  para(
    doc,
    "Express aplica Helmet, CORS con allowlist, límite de cuerpo 16 KB y rate limit en POST /api/contact. Rechaza claves JSON no declaradas, valida longitudes, correo, teléfono, tema (allowlist) y locale. Un honeypot (website) hace que los bots reciban 200 sin enviar correo. Si RESEND_API_KEY falta o es un placeholder, responde 503 operativo. En producción, si existe dist/, el mismo proceso sirve el SPA y el fallback de rutas al index.html.",
  );

  h2(doc, "4.3  Internacionalización y tema");
  para(
    doc,
    "Los textos de interfaz viven en src/i18n/locales/*.json (es predeterminado, más en, fr, zh-CN, pt-BR, de, ja, it, ko). Los temas del formulario usan ids estables; las etiquetas se traducen. El tema visual no es un producto aparte: es estado de UI que también cambia estilos del mapa y el isotipo de cabecera/pie.",
  );

  h1(doc, "5.  Distribución: local frente a producción");
  h2(doc, "5.1  Desarrollo local (npm run dev)");
  bullets(doc, [
    "concurrently arranca npm run dev:api (node server/index.mjs) y npm run dev:web (vite).",
    "API en 127.0.0.1:8787 (API_PORT / PORT). API_HOST por defecto 127.0.0.1.",
    "Vite en :5173. Toda petición a /api se proxyfica a Express. Si la API está caída, el proxy responde 503 en JSON.",
    "Los estáticos de public/ (marca, imágenes, folleto PDF) los sirve Vite.",
    "npm run preview sirve dist/ y sigue usando el mismo proxy: la API debe seguir en marcha aparte.",
  ]);

  h2(doc, "5.2  Producción (npm start, Docker, Render)");
  bullets(doc, [
    "npm run build genera dist/ (TypeScript --noEmit + Vite). Las VITE_* se hornean aquí.",
    "NODE_ENV=production: un proceso sirve dist/ + API. HOST 0.0.0.0 para aceptar tráfico del contenedor.",
    "PORT lo asigna Render; en Docker Compose se fija 8787 y se publica el puerto.",
    "No hay Vite en el contenedor final: solo Node Alpine, dependencias de producción, dist/, server/ y public/ (adjuntos de correo).",
    "TRUST_PROXY=1 para que el rate limit vea la IP del visitante detrás del proxy de Render.",
  ]);
  note(
    doc,
    "Si cambia VITE_GOOGLE_MAPS_KEY hay que reconstruir la imagen: el valor no se lee en runtime del navegador desde el entorno del contenedor, sino del bundle generado en la etapa de build.",
  );

  pageBreakBefore(doc);
  h1(doc, "6.  Estructura del repositorio");
  kvTable(doc, [
    ["src/", "Aplicación React: App, componentes, estilos, tipos Vite."],
    ["src/components/", "Header, formularios, mapas, iconos, controles i18n/tema."],
    ["src/i18n/", "I18nProvider y locales JSON (nueve idiomas)."],
    ["src/theme/", "ThemeProvider (claro / oscuro)."],
    ["src/data/", "coverage.json (GeoJSON de cobertura OSM)."],
    ["src/lib/", "Carga perezosa del script de Google Maps."],
    ["server/", "Express (index.mjs) y plantillas de correo (email.mjs)."],
    ["public/", "favicon, folleto, robots, imágenes de servicios."],
    ["public/brand/", "Kit de marca en runtime (Vite copia a dist/brand/)."],
    ["scripts/", "fetch-coverage.mjs y generate-docs.mjs (PDF locales)."],
    ["docs/", "PDF generados. Solo local; gitignore. No van a GitHub."],
    ["Dockerfile", "Multi-etapa: build Vite + runner Node 20 Alpine."],
    ["docker-compose.yml", "Build local con env_file .env y puerto 8787."],
    ["render.yaml", "Blueprint: web Docker, plan free, health /api/health."],
    [".env.example", "Nombres y propósito de variables. Sin secretos reales."],
    ["ARCHITECTURE.md", "Este mismo relato, versionado en GitHub."],
  ]);
  para(
    doc,
    "node_modules/ y dist/ no se versionan. package-lock.json fija las versiones. .env y src/.env están ignorados. Extraer un PDF comercial o copiar el kit fuera de public/brand/ no forma parte del diseño: la fuente de verdad de marca es public/brand/.",
  );

  h1(doc, "7.  Infraestructura");
  h2(doc, "7.1  Docker multi-etapa");
  para(
    doc,
    "Etapa build: node:20-alpine, npm ci, copia del repo, ARG/ENV de VITE_GOOGLE_MAPS_KEY y VITE_GOOGLE_MAPS_MAP_ID, npm run build. Etapa runner: npm ci --omit=dev, copia dist/, server/ y public/, NODE_ENV=production, PORT=8787, API_HOST=0.0.0.0, TRUST_PROXY=1, CMD node server/index.mjs. El .env no se copia a la imagen; los secretos entran en runtime (compose env_file o panel de Render).",
  );

  h2(doc, "7.2  Render (plan free)");
  para(
    doc,
    "render.yaml declara un servicio web Docker (rose-tech), dockerfilePath ./Dockerfile, healthCheckPath /api/health y plan: free. NODE_ENV, TRUST_PROXY y API_HOST van con valor fijo. RESEND_API_KEY, RESEND_FROM, CEO_EMAIL, VITE_GOOGLE_MAPS_KEY, VITE_GOOGLE_MAPS_MAP_ID y FRONTEND_ORIGIN tienen sync: false: se pegan en el panel, no en Git. Tras el primer despliegue hay que poner FRONTEND_ORIGIN a la URL HTTPS del servicio (sin barra final) y redesplegar.",
  );

  h2(doc, "7.3  Variables de entorno (solo nombres)");
  kvTable(doc, [
    ["RESEND_API_KEY", "Secreto de correo. Solo servidor."],
    ["RESEND_FROM", "Remitente; dominio verificado en producción."],
    ["CEO_EMAIL", "Bandeja interna de leads."],
    ["PORT / API_PORT", "Bind HTTP. Render exige PORT."],
    ["API_HOST", "127.0.0.1 local; 0.0.0.0 en contenedor."],
    ["FRONTEND_ORIGIN", "Orígenes CORS extra, separados por coma."],
    ["RATE_LIMIT_WINDOW_MS", "Ventana del límite de POST /api/contact."],
    ["RATE_LIMIT_MAX", "Máximo de envíos por IP en esa ventana."],
    ["TRUST_PROXY", "1 detrás de proxy inverso (IP real)."],
    ["NODE_ENV", "production oculta PII en logs."],
    ["VITE_GOOGLE_MAPS_KEY", "Pública; restringir referrer. Build-time."],
    ["VITE_GOOGLE_MAPS_MAP_ID", "Map ID opcional. Build-time."],
  ]);
  note(doc, "Este documento no incluye valores. La referencia de propósito es .env.example.");

  h2(doc, "7.4  CORS, Helmet y rate limit");
  bullets(doc, [
    "CORS: localhost:5173, :4173 (y 127.0.0.1) más FRONTEND_ORIGIN. En producción el SPA y la API son el mismo origen.",
    "Helmet: CSP restrictiva en respuestas JSON, sin X-Powered-By, referrer estricto, nosniff.",
    "Rate limit: 5 POST /api/contact por IP cada 15 minutos, configurable.",
    "Vite añade cabeceras equivalentes (Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy) en dev y preview.",
  ]);

  pageBreakBefore(doc);
  h1(doc, "8.  Flujo de datos: formulario → API → Resend");
  para(
    doc,
    "Es el único flujo que mueve datos personales. El visitante elige un tema cerrado (diagnóstico, cotización, Myshop, productos, asesoría, mantenimiento), escribe nombre, correo, teléfono o WhatsApp y un mensaje.",
  );
  bullets(doc, [
    "1. ContactForm valida formato y longitudes en el navegador y envía POST /api/contact (JSON).",
    "2. En local, Vite proxyfica a Express :8787. En producción, Express recibe en el mismo host.",
    "3. Express descarta claves no permitidas, vuelve a validar, aplica rate limit y mira el honeypot.",
    "4. Si la clave de Resend no está lista, 503. Si el honeypot está lleno, 200 sin correo.",
    "5. Resend envía el lead a CEO_EMAIL (HTML escapado, isotipo CID) y, salvo modo de prueba @resend.dev, una confirmación al visitante.",
    "6. El cliente muestra un aviso de texto (no HTML interpolado). Los errores de Resend se traducen a mensajes genéricos.",
  ]);
  para(
    doc,
    "No hay cola, webhook ni tabla de leads. Si Resend rechaza el dominio o la clave, el operador lo ve en logs (sin PII en production) y en el mensaje operativo del formulario. El detalle de amenaza y reporte está en SECURITY.md.",
  );

  h1(doc, "9.  Lo que esta arquitectura no es");
  bullets(doc, [
    "No es un CMS: el copy vive en JSON de i18n y en componentes.",
    "No es un backend de negocio: no hay autenticación, sesiones ni roles.",
    "No es un lago de datos: el correo es el sistema de registro de leads.",
    "Los PDF de docs/ no se publican: npm run docs es una herramienta local.",
  ]);
  para(
    doc,
    "Ese recorte es intencional. Si más adelante ROSE necesita un panel de leads o un blog, se añadiría un servicio con persistencia; no se improvisaría una base dentro de este proceso sin un diseño nuevo.",
  );

  h1(doc, "10.  Documentos relacionados");
  kvTable(doc, [
    ["ARCHITECTURE.md", "Misma sustancia, en el repositorio público/privado de Git."],
    ["README.md / README.es.md", "Arranque, Docker, Render y variables (nombres)."],
    ["SECURITY.md", "Modelo de amenazas y cómo reportar incidentes."],
    ["ROSE-documentacion-tecnica.pdf", "Operación detallada del sitio (local)."],
    ["ROSE-reporte-ejecutivo.pdf", "Síntesis para dirección (local)."],
  ]);
  note(doc, "Uso interno. No incluye claves de API, Maps ni Resend, ni ejemplos de secretos reales.");

  finish(doc, "Arquitectura de sistema");
  return { stream, out };
}

function countPdfPages(file) {
  const text = fs.readFileSync(file).toString("latin1");
  const counts = [...text.matchAll(/\/Type\s*\/Pages\b[\s\S]{0,200}?\/Count\s+(\d+)/g)];
  if (counts.length) return Number(counts[counts.length - 1][1]);
  return (text.match(/\/Type\s*\/Page\b/g) || []).length;
}

const a = technicalPdf();
const b = executivePdf();
const c = architecturePdf();
await Promise.all([waitEnd(a.stream), waitEnd(b.stream), waitEnd(c.stream)]);
console.log("PDF generados:");
console.log(" ", path.relative(ROOT, a.out), `(${countPdfPages(a.out)} pages)`);
console.log(" ", path.relative(ROOT, b.out), `(${countPdfPages(b.out)} pages)`);
console.log(" ", path.relative(ROOT, c.out), `(${countPdfPages(c.out)} pages)`);
