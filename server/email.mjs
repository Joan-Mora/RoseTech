import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TOPIC_IDS = new Set([
  "diagnostico",
  "cotizacion",
  "myshop",
  "productos",
  "asesoria",
  "mantenimiento",
]);

export const TOPICS_ES = {
  diagnostico: "Diagnóstico técnico",
  cotizacion: "Cotización de reparación o mantenimiento",
  myshop: "Demostración gratuita de Myshop",
  productos: "Cotización de productos tecnológicos",
  asesoria: "Asesoría en sistemas administrativos",
  mantenimiento: "Planes de mantenimiento empresarial",
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Old client keys plus every published locale label map to stable IDs. */
const TOPIC_ALIASES = {
  diagnosis: "diagnostico",
  repairQuote: "cotizacion",
  myshopDemo: "myshop",
  productQuote: "productos",
  adminAdvice: "asesoria",
  maintenancePlans: "mantenimiento",
};

try {
  const locDir = path.join(ROOT, "src", "i18n", "locales");
  for (const file of fs.readdirSync(locDir)) {
    if (!file.endsWith(".json")) continue;
    const json = JSON.parse(fs.readFileSync(path.join(locDir, file), "utf8"));
    const topics = json?.contact?.topics;
    if (!topics || typeof topics !== "object") continue;
    for (const [id, label] of Object.entries(topics)) {
      if (TOPIC_IDS.has(id) && typeof label === "string" && label.trim()) {
        const text = label.trim();
        TOPIC_ALIASES[text] = id;
        TOPIC_ALIASES[text.toLowerCase()] = id;
      }
    }
  }
} catch {
  for (const [id, label] of Object.entries(TOPICS_ES)) TOPIC_ALIASES[label] = id;
}

export function normalizeTopic(raw) {
  const tema = String(raw ?? "").trim();
  if (!tema) return "";
  if (TOPIC_IDS.has(tema)) return tema;
  return TOPIC_ALIASES[tema] || TOPIC_ALIASES[tema.toLowerCase()] || "";
}

export function topicFromBody(body) {
  if (!body || typeof body !== "object") return "";
  const candidates = [body.tema, body.topic, body.motivo, body.temaLabel, body.topicLabel];
  for (const raw of candidates) {
    const id = normalizeTopic(Array.isArray(raw) ? raw[0] : raw);
    if (id) return id;
  }
  return "";
}

const CONFIRM = {
  es: {
    subject: "Recibimos su mensaje — ROSE S.A.S.",
    greeting: "Estimado/a",
    received: "Confirmamos que recibimos su solicitud sobre",
    advisor: "Un asesor de ROSE S.A.S. se comunicará pronto por WhatsApp o correo electrónico.",
    hours: "Horario de atención: lunes a sábado, 7:00 a. m. – 7:00 p. m. (Villavicencio, Meta).",
    closer: "Tecnología que impulsa su negocio.",
  },
  en: {
    subject: "We received your message — ROSE S.A.S.",
    greeting: "Dear",
    received: "We confirm that we received your request regarding",
    advisor: "A ROSE S.A.S. advisor will contact you shortly via WhatsApp or email.",
    hours: "Business hours: Monday to Saturday, 7:00 a.m. – 7:00 p.m. (Villavicencio, Meta).",
    closer: "Technology that drives your business.",
  },
  fr: {
    subject: "Nous avons bien reçu votre message — ROSE S.A.S.",
    greeting: "Bonjour",
    received: "Nous confirmons la réception de votre demande concernant",
    advisor: "Un conseiller ROSE S.A.S. vous contactera bientôt par WhatsApp ou e-mail.",
    hours: "Horaires : lundi au samedi, 7 h 00 – 19 h 00 (Villavicencio, Meta).",
    closer: "La technologie qui fait avancer votre activité.",
  },
  "zh-CN": {
    subject: "我们已收到您的留言 — ROSE S.A.S.",
    greeting: "尊敬的",
    received: "我们已收到您关于以下主题的咨询：",
    advisor: "ROSE S.A.S. 顾问将很快通过 WhatsApp 或电子邮件与您联系。",
    hours: "营业时间：周一至周六 7:00–19:00（比亚维森西奥，梅塔省）。",
    closer: "驱动业务的技术。",
  },
  "pt-BR": {
    subject: "Recebemos a sua mensagem — ROSE S.A.S.",
    greeting: "Prezado(a)",
    received: "Confirmamos o recebimento da sua solicitação sobre",
    advisor: "Um assessor da ROSE S.A.S. entrará em contato em breve por WhatsApp ou e-mail.",
    hours: "Horário: segunda a sábado, 7h00 – 19h00 (Villavicencio, Meta).",
    closer: "Tecnologia que impulsiona o seu negócio.",
  },
  de: {
    subject: "Wir haben Ihre Nachricht erhalten — ROSE S.A.S.",
    greeting: "Guten Tag",
    received: "Wir bestätigen den Eingang Ihrer Anfrage zu",
    advisor: "Ein Berater von ROSE S.A.S. meldet sich in Kürze per WhatsApp oder E-Mail.",
    hours: "Öffnungszeiten: Montag bis Samstag, 7:00–19:00 Uhr (Villavicencio, Meta).",
    closer: "Technologie, die Ihr Geschäft voranbringt.",
  },
  ja: {
    subject: "メッセージを受信しました — ROSE S.A.S.",
    greeting: "",
    received: "次の件についてお問い合わせを受領しました：",
    advisor: "担当者がまもなくWhatsAppまたはメールでご連絡します。",
    hours: "営業時間：月曜〜土曜 7:00–19:00（ビジャビセンシオ、メタ県）。",
    closer: "ビジネスを前進させるテクノロジー。",
  },
  it: {
    subject: "Abbiamo ricevuto il vostro messaggio — ROSE S.A.S.",
    greeting: "Gentile",
    received: "Confermiamo di aver ricevuto la vostra richiesta relativa a",
    advisor: "Un consulente ROSE S.A.S. vi contatterà a breve via WhatsApp o e-mail.",
    hours: "Orari: lunedì–sabato, 7:00–19:00 (Villavicencio, Meta).",
    closer: "Tecnologia che fa crescere il vostro business.",
  },
  ko: {
    subject: "메시지를 받았습니다 — ROSE S.A.S.",
    greeting: "",
    received: "다음 건에 대한 요청을 접수했습니다:",
    advisor: "ROSE S.A.S. 상담원이 곧 WhatsApp 또는 이메일로 연락드립니다.",
    hours: "영업시간: 월–토 07:00–19:00 (비야비센시오, 메타).",
    closer: "비즈니스를 이끄는 기술.",
  },
};

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function shell({ title, body }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#111111;font-family:'Segoe UI',Arial,sans-serif;color:#1c1614;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111111;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#070707;padding:22px 28px;border-bottom:4px solid #e10600;">
              <img src="cid:rose-logo" alt="ROSE Technology" width="72" style="display:block;border:0;" />
              <p style="margin:12px 0 0;color:#ffffff;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;">ROSE S.A.S.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#070707;color:#c9b8b6;padding:18px 28px;font-size:12px;line-height:1.6;">
              ROSE S.A.S. · Cra. 39 #10 51, Esperanza, Villavicencio, Meta<br/>
              <span style="color:#e10600;">Tecnología que impulsa su negocio.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function leadHtml({ nombre, email, telefono, temaEs, temaLocal, mensaje, locale }) {
  const extra =
    temaLocal && temaLocal !== temaEs
      ? `<tr><td style="padding:8px 0;color:#6a5e58;">Tema (${esc(locale)})</td><td style="padding:8px 0;">${esc(temaLocal)}</td></tr>`
      : "";
  return shell({
    title: "Nuevo lead ROSE S.A.S.",
    body: `
      <p style="margin:0 0 16px;font-size:15px;">Ha llegado una nueva solicitud desde el sitio corporativo.</p>
      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:8px 0;width:160px;color:#6a5e58;">Nombre</td><td>${esc(nombre)}</td></tr>
        <tr><td style="padding:8px 0;color:#6a5e58;">Correo</td><td>${esc(email)}</td></tr>
        <tr><td style="padding:8px 0;color:#6a5e58;">Teléfono / WhatsApp</td><td>${esc(telefono)}</td></tr>
        <tr><td style="padding:8px 0;color:#6a5e58;">Tema</td><td>${esc(temaEs)}</td></tr>
        ${extra}
      </table>
      <p style="margin:20px 0 8px;font-weight:700;">Mensaje</p>
      <p style="margin:0;padding:14px;background:#f6f3ef;border-left:3px solid #e10600;border-radius:8px;">${esc(mensaje).replace(/\n/g, "<br/>")}</p>
    `,
  });
}

export function confirmCopy(locale) {
  return CONFIRM[locale] || CONFIRM.en;
}

export function visitorHtml({ nombre, temaLabel, locale }) {
  const copy = confirmCopy(locale);
  const greet = copy.greeting ? `${copy.greeting} ${esc(nombre)},` : `${esc(nombre)},`;
  return {
    subject: copy.subject,
    html: shell({
      title: copy.subject,
      body: `
        <p style="margin:0 0 12px;font-size:16px;">${greet}</p>
        <p style="margin:0 0 12px;">${copy.received} <strong>${esc(temaLabel)}</strong>.</p>
        <p style="margin:0 0 12px;">${copy.advisor}</p>
        <p style="margin:0 0 16px;color:#6a5e58;">${copy.hours}</p>
        <p style="margin:0;font-weight:700;">ROSE S.A.S.<br/><span style="color:#e10600;">${copy.closer}</span></p>
      `,
    }),
  };
}

export function logoAttachment() {
  const dirs = [path.join(ROOT, "public", "brand"), path.join(ROOT, "dist", "brand")];
  const names = ["logo-mark-red.png", "logo-hero.png"];
  const file = dirs
    .flatMap((dir) => names.map((name) => path.join(dir, name)))
    .find((p) => fs.existsSync(p));
  if (!file) return null;
  return {
    filename: "rose-logo.png",
    content: fs.readFileSync(file),
    contentId: "rose-logo",
  };
}
