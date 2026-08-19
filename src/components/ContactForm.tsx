import { FormEvent, useMemo, useRef, useState } from "react";
import { TOPIC_IDS, isTopicId, type TopicId } from "../i18n/locales";
import { useI18n } from "../i18n/I18nProvider";
import SelectField from "./SelectField";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

type FieldName = "nombre" | "email" | "telefono" | "tema" | "mensaje" | "body";

type ContactResponse = {
  error?: string;
  field?: string;
  ok?: boolean;
};

function asField(raw: string | undefined, error: string): FieldName | "" {
  if (raw === "nombre" || raw === "email" || raw === "telefono" || raw === "tema" || raw === "mensaje" || raw === "body") {
    return raw;
  }
  if (/nombre/i.test(error)) return "nombre";
  if (/correo|e-?mail/i.test(error)) return "email";
  if (/tel[eé]fono|whatsapp|phone/i.test(error)) return "telefono";
  if (/ayudarle|tema|topic|seleccione cómo/i.test(error)) return "tema";
  if (/describa|mensaje|detalle/i.test(error)) return "mensaje";
  return "";
}

export default function ContactForm() {
  const { m, locale } = useI18n();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, setPending] = useState(false);
  const [tema, setTema] = useState("");
  const [invalid, setInvalid] = useState<FieldName | "">("");
  const temaRef = useRef("");

  const options = useMemo(
    () => TOPIC_IDS.map((id) => ({ value: id, label: m.contact.topics[id] })),
    [m],
  );

  function onTemaChange(id: string) {
    temaRef.current = id;
    setTema(id);
    if (invalid === "tema") setInvalid("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    setInvalid("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get("nombre") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const telefono = String(data.get("telefono") ?? "").trim();
    const website = String(data.get("website") ?? "").trim();
    const hiddenTema = String(data.get("tema") ?? "").trim();
    const temaId = [tema, temaRef.current, hiddenTema].find((v) => isTopicId(v)) ?? "";
    const mensaje = String(data.get("mensaje") ?? "").trim();

    if (nombre.length < 3) {
      setInvalid("nombre");
      return setError(m.contact.errName);
    }
    if (!emailOk(email)) {
      setInvalid("email");
      return setError(m.contact.errEmail);
    }
    if (telefono.replace(/\D/g, "").length < 7) {
      setInvalid("telefono");
      return setError(m.contact.errPhone);
    }
    if (!isTopicId(temaId)) {
      setInvalid("tema");
      return setError(m.contact.errTopic);
    }
    if (mensaje.length < 12) {
      setInvalid("mensaje");
      return setError(m.contact.errMessage);
    }

    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          tema: temaId,
          temaLabel: m.contact.topics[temaId as TopicId],
          mensaje,
          locale,
          website,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as ContactResponse;
      const safeError =
        typeof payload.error === "string" && payload.error.trim() && payload.error.length < 280
          ? payload.error.trim()
          : "";
      const field = asField(payload.field, safeError);

      if (!res.ok) {
        if (field) setInvalid(field);
        if (res.status === 502 || res.status === 504) {
          setError(safeError || m.contact.errApi);
          return;
        }
        if (res.status === 400 && field === "tema") {
          setError(safeError || m.contact.errTopic);
          return;
        }
        setError(safeError || m.contact.errSend);
        return;
      }

      form.reset();
      temaRef.current = "";
      setTema("");
      setOk(m.contact.success);
    } catch {
      setError(m.contact.errNetwork);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact" onSubmit={onSubmit} noValidate>
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={`field${invalid === "nombre" ? " is-invalid" : ""}`}>
        <label htmlFor="nombre">{m.contact.name}</label>
        <input
          id="nombre"
          name="nombre"
          autoComplete="name"
          required
          maxLength={120}
          aria-invalid={invalid === "nombre"}
        />
      </div>
      <div className="form-row">
        <div className={`field${invalid === "email" ? " is-invalid" : ""}`}>
          <label htmlFor="email">{m.contact.emailLabel}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            aria-invalid={invalid === "email"}
          />
        </div>
        <div className={`field${invalid === "telefono" ? " is-invalid" : ""}`}>
          <label htmlFor="telefono">{m.contact.phoneLabel}</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            aria-invalid={invalid === "telefono"}
          />
        </div>
      </div>
      <div className={`field${invalid === "tema" ? " is-invalid" : ""}`}>
        <label htmlFor="tema">{m.contact.topicLabel}</label>
        <SelectField
          id="tema"
          name="tema"
          value={tema}
          required
          invalid={invalid === "tema"}
          placeholder={m.contact.topicPlaceholder}
          options={options}
          listLabel={m.a11y.helpTopics}
          onChange={onTemaChange}
        />
      </div>
      <div className={`field${invalid === "mensaje" ? " is-invalid" : ""}`}>
        <label htmlFor="mensaje">{m.contact.message}</label>
        <textarea
          id="mensaje"
          name="mensaje"
          placeholder={m.contact.messagePlaceholder}
          required
          maxLength={4000}
          aria-invalid={invalid === "mensaje"}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {ok ? <p className="form-ok">{ok}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? m.contact.sending : m.contact.submit}
      </button>
    </form>
  );
}
