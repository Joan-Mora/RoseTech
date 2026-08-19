# Seguridad — ROSE Technology

Documento de referencia para el sitio corporativo y la API de contacto de ROSE S.A.S. No contiene secretos.

## Cómo reportar un problema

Si identifica una vulnerabilidad, **no** abra un issue público con explotaciones ni claves.

1. Envíe un correo a `serviciotechrose@gmail.com` con una descripción, el impacto y, si es posible, pasos para reproducirla en un entorno de prueba.
2. El equipo acusará recibo y coordinará una corrección.
3. Absténgase de acceder a datos de terceros o de saturar el formulario de contacto.

## Modelo de amenazas (resumen)

| Activo | Riesgo principal | Mitigación |
| --- | --- | --- |
| Clave de Resend | Uso no autorizado y envío masivo de correo | Solo en el servidor, nunca `VITE_*` |
| Bandeja de leads | Spam, inyección HTML en el correo interno | Validación, honeypot, rate limit, escape HTML |
| Clave de Maps | Abuso de cuota de Google | Restricción por HTTP referrer y por API |
| Sitio estático | XSS, clickjacking, filtrado de referrer | CSP, cabeceras, sin `innerHTML` de usuario |
| API | CORS abierto, cuerpos enormes, fugas de pila | Allowlist, límite 16 KB, errores genéricos |

El sitio es informativo. No hay autenticación de clientes, pasarela de pago ni base de datos de usuarios. El único flujo sensible es **contacto → correo**.

## Qué está protegido

- **Secretos de servidor:** `RESEND_API_KEY` y el resto de variables sin prefijo `VITE_` viven en `.env` (fuera de Git).
- **CORS:** solo `localhost` de Vite/preview y los orígenes de `FRONTEND_ORIGIN`.
- **Producción:** un proceso Node sirve `dist/` y `/api`. En Render/Docker ponga `TRUST_PROXY=1` y `FRONTEND_ORIGIN` a la URL HTTPS del servicio.
- **Helmet** en Express: CSP restrictiva para respuestas JSON, `X-Content-Type-Options`, política de referrer, sin `X-Powered-By`.
- **Límite de ritmo** en `POST /api/contact` (predeterminado: 5 solicitudes / 15 minutos por IP).
- **Cuerpo JSON** limitado a 16 KB.
- **Campos permitidos:** `nombre`, `email`, `telefono`, `tema`, `temaLabel`, `mensaje`, `locale`, `website`. Cualquier otra clave se rechaza.
- **Validación:** longitudes, correo, teléfono y lista cerrada de temas.
- **Honeypot:** si `website` tiene valor, la API responde éxito y **no** envía correo.
- **Plantillas de correo:** el texto del visitante se escapa (`&`, `<`, `>`, comillas).
- **Errores al cliente:** mensajes operativos, **sin** trazas de pila ni detalle de Resend.
- **Registros:** en `NODE_ENV=production` no se anotan nombres, correos ni mensajes.
- **Frontend:** CSP y referrer en `index.html`; cabeceras equivalentes en Vite; el formulario pinta errores como texto.

## Qué es público a propósito

- Textos, imágenes y PDFs comerciales del sitio.
- `VITE_GOOGLE_MAPS_KEY` y `VITE_GOOGLE_MAPS_MAP_ID`: Vite las incrusta en el JavaScript. Eso es el modelo de Google Maps en el navegador. La defensa es **restringir la clave**, no ocultarla.
- La dirección, teléfono y correo publicados en el pie de página.

## Google Maps

En Google Cloud Console:

1. Restricción de aplicaciones: **referentes HTTP** (`https://sudominio.com/*`, y localhost solo en desarrollo).
2. Restricción de API: Maps JavaScript API y Maps Embed API.
3. No deje una clave sin restricción en un sitio público.

Si la clave falta o Google la rechaza, el mapa de sede cae al iframe embebido.

## Resend

- Verifique el dominio del remitente (`RESEND_FROM`) antes de producción.
- `onboarding@resend.dev` solo entrega a la cuenta de Resend; no sirve como canal real de leads.
- La API nunca reenvía la clave ni el HTML crudo de error de Resend al navegador.

## Límite de ritmo y proxy

Si publica la API detrás de nginx, Caddy o un CDN, defina `TRUST_PROXY=1` para que el límite use la IP del visitante y no la del proxy. Ajuste `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_MS` si un kiosco o una feria generan tráfico legítimo repetido.

## Dependencias

Las versiones se fijan en `package-lock.json`. Tras actualizar paquetes:

```bash
npm audit
npm run build
```

Corrija avisos de gravedad alta cuando exista parche compatible. No ejecute `npm audit fix --force` sin revisar roturas.

## Entorno y Git

- `.env` y `src/.env` están en `.gitignore`.
- `.env.example` documenta **nombres** y propósito, no valores secretos.
- No incruste claves en README, este archivo ni en los PDF de `docs/`.

Última revisión alineada con el endurecimiento de la API Express y las cabeceras del frontend.
