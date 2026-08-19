# Architecture — ROSE Technology

Sitio institucional de **ROSE S.A.S.** (marca comercial **ROSE Technology**). Este documento describe la arquitectura elegida, el motivo de cada pieza y cómo se reparte el sistema en local y en producción.

**No hay secretos en este archivo.**

Related: [README.md](./README.md) · [README.es.md](./README.es.md) · [SECURITY.md](./SECURITY.md) · [CHANGELOG.md](./CHANGELOG.md)

---

## 1. Chosen architecture

Una **aplicación de una sola página** (Vite 7 + React 19 + TypeScript 5.9) más una **API Express 5 mínima** en el mismo proceso Node en producción.

| Capa | Elección |
| --- | --- |
| Interfaz | Vite, React, TypeScript, CSS propio (negro / blanco / `#e10600`) |
| API | Express (`server/index.mjs`): contacto, salud y estáticos `dist/` en producción |
| Correo | SDK de [Resend](https://resend.com/) solo en el servidor |
| Mapas | Google Maps JavaScript API, o iframe Embed si falta la clave pública |
| i18n | Locales JSON + `I18nProvider` (nueve idiomas, español por defecto) |
| Tema | Claro / oscuro vía `ThemeProvider` |
| Empaque | Docker multi-etapa (`node:20-alpine`) |
| Alojamiento | Render, plan **free**, runtime Docker (`render.yaml`) |

**No hay base de datos de aplicación.** Los leads van al correo. Idioma y tema persisten en `localStorage`. Los polígonos de cobertura son GeoJSON versionado.

```
Visitante (navegador)
        │
        ▼
┌───────────────────────┐     ┌──────────────────────────┐
│ Entrega                 │     │ API Express               │
│ Dev: Vite :5173 + proxy │────▶│ POST /api/contact         │
│      /api               │     │ GET  /api/health          │
│ Prod: Express sirve     │     │ Helmet, CORS, rate limit  │
│      dist/ + PORT       │     └────────────┬─────────────┘
└───────────┬─────────────┘                  │
            │                                ▼
            ▼                         Resend (secreto en Node)
     Google Maps                      CEO_EMAIL + visitante
     (VITE_* en el bundle)
```

En producción el origen del sitio y el de la API coinciden. El formulario hace `POST` a `/api/contact` en el mismo host.

---

## 2. Why these choices

### Folleto corporativo, no una plataforma

El sitio presenta marca, servicio técnico, **Myshop**, productos y cobertura en el Meta, y convierte al visitante en un correo. No hay cuentas, pagos ni almacén propio de leads. Un SPA estático más un endpoint de correo cubre ese alcance sin migraciones ni un segundo servicio que operar.

### Una sola unidad de despliegue

Separar el hosting de Vite del de Express duplicaría URL, CORS, health checks y facturación en un plan gratuito. Un proceso Node que sirve `dist/` y `/api` implica un contenedor, un `PORT` (el que asigna Render) y una URL.

En local sigue importando la recarga rápida: `npm run dev` levanta API y Vite en paralelo; Vite reenvía `/api` a `127.0.0.1:8787`.

### Resend y Maps imponen el corte cliente / servidor

- **Resend:** la clave es un secreto. Un prefijo `VITE_*` la incrustaría en el JavaScript del navegador. Solo la lee Node.
- **Google Maps:** la clave de navegador es pública por el modelo de Google. Vite incrusta `VITE_GOOGLE_MAPS_KEY` en el **build**. La defensa es restringir por HTTP referrer y por API (Maps JavaScript y Maps Embed), no ocultar el valor.

### Sin base de datos extra

Los leads no se guardan en Postgres ni en un CRM propio: llegan a `CEO_EMAIL` y el visitante recibe confirmación. Una base habría significado copias de seguridad, credenciales, un datastore de pago en Render y más superficie de ataque sin necesidad de negocio en esta fase.

### Docker y Render (plan free)

La imagen de dos etapas deja compiladores y dependencias de desarrollo fuera del runtime. Render construye esa imagen, inyecta secretos del panel (`sync: false` en el blueprint) y comprueba `GET /api/health`. El plan gratuito puede dormir el proceso por inactividad: aceptable para un folleto, no para una API crítica 24/7.

---

## 3. What each part is for

| Pieza | Función |
| --- | --- |
| **Frontend** (`src/`) | Anclas de una página, nav fija y cajón móvil, formularios, mapas, aviso de cookies, JSON-LD `LocalBusiness`. |
| **`POST /api/contact`** | Único flujo de escritura de negocio: validar el lead y enviar correo. |
| **`GET /api/health`** | Comprobación de vida para Docker/Render. Sin datos personales. |
| **Resend** | Lead interno a `CEO_EMAIL` (HTML escapado, logo CID) y confirmación al visitante. |
| **Google Maps** | Pin de sede (`LocationMap`) y polígonos de cobertura (`CoverageMap` + `src/data/coverage.json`). |
| **i18n** | Nueve JSON de idioma; `lang` del documento; preferencia en `localStorage`. Temas del formulario con ids estables. |
| **Tema** | Oscuro (predeterminado corporativo) / claro; la primera visita puede seguir `prefers-color-scheme`; mapas y logos siguen el tema. |
| **Marca** (`public/brand/`) | Logos de sitio, pie, PDF y adjunto del correo. |

El navegador no habla con Resend. Overpass de OpenStreetMap solo lo usa `scripts/fetch-coverage.mjs` en máquina de desarrollo. Los mapas no piden geolocalización del visitante.

---

## 4. Distribution

### Local — `npm run dev`

- `concurrently` arranca `npm run dev:api` (`node server/index.mjs`) y `npm run dev:web` (`vite`).
- La API escucha en `127.0.0.1:8787` por defecto (`API_PORT` / `PORT`). `API_HOST` predeterminado: `127.0.0.1`.
- Vite en el puerto **5173** y proxy de `/api` hacia Express. Si la API está caída, el proxy responde JSON `503`.
- `public/` (marca, fotos, folleto PDF) lo sirve Vite.
- `npm run preview` sirve `dist/` y sigue haciendo proxy de `/api`; el proceso de la API debe estar aparte.

### Production — `npm start`, Docker, Render

- `npm run build` comprueba TypeScript y escribe `dist/`. Todas las `VITE_*` se hornean en este paso.
- `NODE_ENV=production`: un proceso sirve `dist/` y la API. `API_HOST=0.0.0.0` para que el contenedor acepte tráfico.
- Render asigna `PORT`. Docker Compose publica **8787**.
- La imagen final es solo Node Alpine: `npm ci --omit=dev` de producción, `dist/`, `server/` y `public/` (activos de correo). Vite no está en la etapa runner.
- `TRUST_PROXY=1` para que el rate limit vea la IP del visitante detrás del proxy de Render.

Si cambia `VITE_GOOGLE_MAPS_KEY` hay que **reconstruir**: el navegador no la lee del entorno del contenedor en runtime.

---

## 5. Repository layout

```
src/                    Aplicación React
src/components/         Header, formularios, mapas, iconos, controles i18n/tema
src/i18n/               I18nProvider + locales/*.json
src/theme/              ThemeProvider
src/data/coverage.json  GeoJSON de cobertura (OSM)
src/lib/                Carga del script de Google Maps
server/                 Express + plantillas de correo
public/                 Favicon, folleto, robots, fotos de servicios
public/brand/           Kit de marca (Vite lo copia a dist/brand/)
scripts/                Cobertura OSM
Dockerfile              Imagen de producción multi-etapa
docker-compose.yml      Arranque local tipo producción
render.yaml             Blueprint de Render (plan free)
.env.example            Nombres y propósito de variables — sin secretos reales
ARCHITECTURE.md         Este archivo (GitHub)
```

`node_modules/` y `dist/` no se versionan. `package-lock.json` fija versiones. `.env` y `src/.env` están en `.gitignore`.

---

## 6. Infrastructure

### Docker multi-stage

1. **build:** `node:20-alpine`, `npm ci`, copia del código, `ARG`/`ENV` de `VITE_GOOGLE_MAPS_KEY` y `VITE_GOOGLE_MAPS_MAP_ID`, `npm run build`.
2. **runner:** `npm ci --omit=dev`, copia `dist/`, `server/`, `public/`. `NODE_ENV=production`, `PORT=8787`, `API_HOST=0.0.0.0`, `TRUST_PROXY=1`, `CMD node server/index.mjs`.

`.env` no entra en la imagen. Los secretos llegan en runtime (`env_file` o el panel de Render).

### Render (free plan)

`render.yaml` declara el servicio web `rose-tech`, runtime Docker, `healthCheckPath: /api/health`, `plan: free`.

Fijos en Git: `NODE_ENV`, `TRUST_PROXY`, `API_HOST`.  
Solo panel (`sync: false`): `RESEND_API_KEY`, `RESEND_FROM`, `CEO_EMAIL`, `VITE_GOOGLE_MAPS_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`, `FRONTEND_ORIGIN`.

Tras el primer despliegue, defina `FRONTEND_ORIGIN` como `https://<servicio>.onrender.com` (sin barra final) y **vuelva a desplegar**.

### Environment variables (nombres únicamente)

**Servidor:** `RESEND_API_KEY`, `RESEND_FROM`, `CEO_EMAIL`, `PORT`, `API_PORT`, `API_HOST`, `FRONTEND_ORIGIN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `TRUST_PROXY`, `NODE_ENV`.

**Cliente (públicas a propósito, en el build):** `VITE_GOOGLE_MAPS_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`.

Propósito y comentarios: `.env.example`. Nunca versionar valores reales.

### CORS, Helmet y rate limit

- **CORS:** `localhost` / `127.0.0.1` puertos `5173` y `4173` de Vite, más `FRONTEND_ORIGIN`.
- **Helmet** en respuestas JSON: CSP restrictiva, sin `X-Powered-By`, referrer estricto, `nosniff`.
- **Rate limit:** 5 `POST /api/contact` por IP cada 15 minutos (predeterminado).
- Cuerpo JSON / urlencoded tope **16 KB**; se rechazan claves JSON no declaradas.
- Vite añade cabeceras equivalentes en `dev` y `preview`.

---

## 7. Data flow — formulario → API → Resend

El único camino que mueve datos personales.

1. El visitante elige un tema cerrado (diagnóstico, cotización, Myshop, productos, asesoría, mantenimiento) y deja nombre, correo, teléfono/WhatsApp y mensaje.
2. `ContactForm` valida en el navegador y envía `POST` JSON a `/api/contact`.
3. En local, Vite proxyfica a Express `:8787`. En producción, Express atiende el mismo origen.
4. Express vuelve a validar, aplica rate limit y mira el honeypot oculto `website`.
5. Clave de Resend ausente o placeholder → `503`. Honeypot relleno → `200` y **sin** correo.
6. Resend envía el lead a `CEO_EMAIL` y, salvo modo de prueba `resend.dev`, una confirmación al visitante.
7. La interfaz muestra nodos de texto (no HTML del servidor). Los errores del proveedor se traducen a copy genérico. En production los logs no incluyen PII.

No hay cola, webhook ni tabla de leads. Modelo de amenazas y reporte: [SECURITY.md](./SECURITY.md).

---

## 8. What this architecture is not

- No es un CMS: los textos viven en JSON de i18n y en componentes.
- No es un backend de negocio: no hay autenticación, sesiones ni roles.
- No es un almacén de datos: el correo es el sistema de registro de leads.

Un panel de leads o un blog exigiría un diseño de persistencia nuevo, no una base improvisada dentro de este proceso.
