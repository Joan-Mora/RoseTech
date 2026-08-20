import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import cors from "cors";
import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";
import { Resend } from "resend";
import {
  TOPIC_IDS,
  TOPICS_ES,
  topicFromBody,
  confirmCopy,
  leadHtml,
  logoAttachment,
  parseLeadRecipients,
  visitorHtml,
} from "./email.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: path.join(ROOT, ".env") });

const IS_PROD = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || process.env.API_PORT || 8787);
const HOST = process.env.API_HOST || (IS_PROD ? "0.0.0.0" : "127.0.0.1");
const DIST = path.join(ROOT, "dist");
const SERVE_STATIC = process.env.SERVE_STATIC !== "0" && fs.existsSync(DIST);
const LOCALES = new Set(["es", "en", "fr", "zh-CN", "pt-BR", "de", "ja", "it", "ko"]);
const ALLOWED_FIELDS = new Set([
  "nombre",
  "email",
  "telefono",
  "tema",
  "temaLabel",
  "mensaje",
  "locale",
  "website",
]);

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const phoneOk = (v) => /^\+?[\d\s()./-]{7,40}$/.test(v) && v.replace(/\D/g, "").length >= 7;

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function allowedOrigins() {
  const extra = String(process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    ...extra,
  ];
}

function logSafe(scope, extra = {}) {
  if (IS_PROD) {
    console.info("Contact API:", scope);
    return;
  }
  console.info("Contact API:", scope, extra);
}

function logResendFailure(scope, err) {
  const statusCode = Number(err?.statusCode || err?.status || 0) || undefined;
  const name = typeof err?.name === "string" ? err.name : "unknown";
  console.error("Contact API:", scope, { name, statusCode });
}

function publicMailError(err) {
  const statusCode = Number(err?.statusCode || err?.status || 0);
  const blob = `${err?.name ?? ""} ${err?.message ?? ""}`.toLowerCase();

  if (statusCode === 401 || blob.includes("invalid api key") || blob.includes("unauthorized")) {
    return {
      status: 503,
      error: "El envío de correo no está configurado. Escríbanos por WhatsApp.",
    };
  }
  if (
    blob.includes("not verified") ||
    blob.includes("domain is not verified") ||
    blob.includes("verify a domain")
  ) {
    return {
      status: 503,
      error:
        "El dominio de correo no está verificado en Resend. Mientras tanto, escríbanos por WhatsApp.",
    };
  }
  if (
    blob.includes("only send testing emails") ||
    blob.includes("own email address") ||
    blob.includes("testing emails") ||
    blob.includes("resend.dev")
  ) {
    return {
      status: 503,
      error:
        "Resend está en modo de prueba (onboarding@resend.dev): solo entrega al correo de la cuenta. Verifique un dominio propio o escríbanos por WhatsApp.",
    };
  }
  return {
    status: 503,
    error: "No fue posible notificar al equipo. Intente de nuevo o use WhatsApp.",
  };
}

function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Solicitud no válida.", field: "body" };
  }

  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(key)) {
      return { error: "Solicitud no válida.", field: "body" };
    }
  }

  const website = String(body.website ?? "").trim();
  if (website) {
    return { honeypot: true };
  }

  const nombre = String(body.nombre ?? "").trim();
  const email = String(body.email ?? "").trim();
  const telefono = String(body.telefono ?? "").trim();
  const tema = topicFromBody(body);
  const temaLabel = String(body.temaLabel ?? "").trim().slice(0, 160);
  const mensaje = String(body.mensaje ?? "").trim();
  const localeRaw = String(body.locale ?? "es").trim();
  const locale = LOCALES.has(localeRaw) ? localeRaw : "es";

  if (nombre.length < 3 || nombre.length > 120) {
    return { error: "Indique su nombre completo.", field: "nombre" };
  }
  if (!emailOk(email) || email.length > 160) {
    return { error: "Ingrese un correo electrónico válido.", field: "email" };
  }
  if (!phoneOk(telefono)) {
    return { error: "Ingrese un teléfono o WhatsApp de contacto.", field: "telefono" };
  }
  if (!TOPIC_IDS.has(tema)) {
    return { error: "Seleccione cómo podemos ayudarle.", field: "tema" };
  }
  if (mensaje.length < 12 || mensaje.length > 4000) {
    return { error: "Describa su necesidad con un poco más de detalle.", field: "mensaje" };
  }

  return {
    data: {
      nombre,
      email,
      telefono,
      tema,
      temaLabel: temaLabel || TOPICS_ES[tema],
      mensaje,
      locale,
    },
  };
}

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

const helmetExtras = {
  crossOriginResourcePolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
};

const apiHelmet = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
  ...helmetExtras,
});

// Keep in sync with the Content-Security-Policy meta in index.html (Maps, fonts).
const siteHelmet = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://maps.googleapis.com",
        "https://maps.gstatic.com",
        "https://*.googleapis.com",
        "https://*.gstatic.com",
        "https://*.google.com",
        "https://*.ggpht.com",
      ],
      connectSrc: [
        "'self'",
        "https://maps.googleapis.com",
        "https://places.googleapis.com",
        "ws:",
        "wss:",
      ],
      frameSrc: ["https://www.google.com", "https://maps.google.com"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  ...helmetExtras,
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return apiHelmet(req, res, next);
  return siteHelmet(req, res, next);
});

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const ok = allowedOrigins().includes(origin.replace(/\/$/, ""));
      if (ok) return cb(null, true);
      return cb(null, false);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: "El mensaje es demasiado extenso.",
      field: "body",
    });
  }
  if (err?.type === "entity.parse.failed" || (err instanceof SyntaxError && "body" in err)) {
    return res.status(400).json({
      error: "No se pudo leer el formulario. Intente de nuevo.",
      field: "body",
    });
  }
  return next(err);
});

const contactLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
  handler: (_req, res) => {
    res.setHeader("Retry-After", "900");
    res.status(429).json({
      error: "Hay demasiadas solicitudes. Intente de nuevo en unos minutos.",
      field: "body",
    });
  },
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  logSafe("inbound", { fieldCount: Object.keys(body).length });

  const parsed = validate(body);
  if (parsed.honeypot) {
    return res.json({ ok: true });
  }
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error, field: parsed.field });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxxxxxxx") || apiKey.startsWith("VITE_")) {
    console.error("Contact API: mail provider is not configured.");
    return res.status(503).json({
      error: "El envío de correo no está configurado. Escríbanos por WhatsApp.",
      field: "mail",
    });
  }

  const from = process.env.RESEND_FROM || "ROSE Technology <noreply@abacore.co>";
  const leadTo = parseLeadRecipients();
  if (!leadTo.length) {
    console.error("Contact API: LEAD_TO / CEO_EMAIL is not configured.");
    return res.status(503).json({
      error: "El envío de correo no está configurado. Escríbanos por WhatsApp.",
      field: "mail",
    });
  }
  const testingFrom = /@resend\.dev\b/i.test(from);
  const { nombre, email, telefono, tema, temaLabel, mensaje, locale } = parsed.data;
  const temaEs = TOPICS_ES[tema];
  const resend = new Resend(apiKey);
  const logo = logoAttachment();
  const attachments = logo ? [logo] : undefined;

  try {
    const ceoResult = await resend.emails.send({
      from,
      to: leadTo,
      ...(testingFrom ? {} : { replyTo: email }),
      subject: `Nuevo lead ROSE Technology — ${temaEs}`,
      html: leadHtml({
        nombre,
        email,
        telefono,
        temaEs,
        temaLocal: temaLabel,
        mensaje,
        locale,
      }),
      ...(attachments ? { attachments } : {}),
    });
    if (ceoResult.error) {
      logResendFailure("failed to email team", ceoResult.error);
      const pub = publicMailError(ceoResult.error);
      return res.status(pub.status).json({ error: pub.error, field: "mail" });
    }

    if (testingFrom) {
      return res.json({ ok: true });
    }

    const visitor = visitorHtml({ nombre, temaLabel, locale });
    const visitorResult = await resend.emails.send({
      from,
      to: email,
      subject: visitor.subject,
      html: visitor.html,
      ...(attachments ? { attachments } : {}),
    });
    if (visitorResult.error) {
      logResendFailure("visitor confirmation failed", visitorResult.error);
    }

    return res.json({ ok: true, locale: confirmCopy(locale).subject ? locale : "es" });
  } catch (err) {
    logResendFailure("unexpected send failure", err);
    const pub = publicMailError(err);
    return res.status(pub.status).json({ error: pub.error, field: "mail" });
  }
});

if (SERVE_STATIC && fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, fallthrough: true }));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Recurso no encontrado." });
});

app.use((err, _req, res, _next) => {
  console.error("API error", typeof err?.name === "string" ? err.name : "unknown");
  if (res.headersSent) return;
  res.status(500).json({ error: "Ha ocurrido un error. Intente de nuevo más tarde." });
});

app.listen(PORT, HOST, () => {
  console.log(`ROSE API listening on http://${HOST}:${PORT}`);
});
