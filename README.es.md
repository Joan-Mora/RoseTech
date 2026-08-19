[English](README.md) | [Español](README.es.md)

# ROSE Technology — Sitio corporativo

Sitio web institucional de **ROSE S.A.S.** (marca comercial **ROSE Technology**), centro de reparación y optimización de sistemas empresariales con sede en Villavicencio, Meta, Colombia.

Presenta la oferta de servicio técnico, el software administrativo **Myshop**, productos tecnológicos, cobertura territorial y un canal de contacto que notifica al equipo por correo.

## Stack

| Capa | Tecnología |
| --- | --- |
| Interfaz | [Vite](https://vitejs.dev/) + [React](https://react.dev/) 19 + TypeScript |
| Estilos | CSS propio, paleta corporativa (negro, blanco, rojo `#e10600`) |
| API de contacto | [Express](https://expressjs.com/) 5 (`server/index.mjs`) |
| Correo | [Resend](https://resend.com/) (clave **solo en el servidor**) |
| Mapas | Google Maps JavaScript API / iframe Embed si no hay clave |
| Producción | Un proceso Node: estáticos `dist/` + `POST /api/contact` |

## Cómo ejecutarlo (local)

Requisitos: Node.js 20 o superior.

```bash
npm install
```

Copie `.env.example` a `.env` en la **raíz** del repositorio y complete las variables. No cree `src/.env` ni use el prefijo `VITE_` para secretos.

```bash
npm run dev
```

Ese comando levanta **dos procesos**:

- API de contacto en `http://127.0.0.1:8787`
- Sitio Vite; el proxy reenvía `/api` a Express

Compilación estática (solo frontend):

```bash
npm run build
npm run preview
```

`npm run preview` sirve el frontend y sigue haciendo proxy de `/api` hacia una API aparte. En producción use `npm start` (o Docker) para que **un solo proceso** sirva `dist/` y la API.

Documentos PDF de proyecto (se generan en local con `npm run docs`; **no** van a GitHub):

```bash
npm run docs
```

## Variables de entorno

Definidas en `.env.example`. **No** copie claves reales a README, issues, PDFs ni `render.yaml`.

### Servidor (secretos)

| Variable | Propósito |
| --- | --- |
| `RESEND_API_KEY` | Clave de la API de Resend. Solo la lee Node. Nunca `VITE_*`. |
| `RESEND_FROM` | Remitente. En producción use un dominio **verificado** en Resend. |
| `CEO_EMAIL` | Destinatario interno de cada lead. |
| `PORT` | Puerto HTTP en producción (Render lo asigna). Predeterminado `8787`. |
| `API_PORT` | Puerto local de la API si no hay `PORT` (predeterminado `8787`). |
| `API_HOST` | Interfaz de escucha (`127.0.0.1` en local; `0.0.0.0` en Docker/Render). |
| `FRONTEND_ORIGIN` | Orígenes extra permitidos por CORS (coma-separados), además de localhost Vite. Tras el primer deploy, ponga la URL de Render. |
| `RATE_LIMIT_WINDOW_MS` | Ventana del límite de `POST /api/contact` (ms). Predeterminado 15 min. |
| `RATE_LIMIT_MAX` | Máximo de envíos por IP en esa ventana. Predeterminado 5. |
| `TRUST_PROXY` | Ponga `1` si hay proxy inverso, para honrar `X-Forwarded-For`. |
| `NODE_ENV` | Use `production` en Docker/Render (no registra datos del formulario). |

### Cliente (públicas a propósito)

| Variable | Propósito |
| --- | --- |
| `VITE_GOOGLE_MAPS_KEY` | Clave de Maps. Viaja al navegador. **Restrínjala por HTTP referrer** y, si puede, solo a Maps JavaScript API y Maps Embed API. Debe existir en el **build** de Vite / Docker. |
| `VITE_GOOGLE_MAPS_MAP_ID` | Map ID opcional (estilos / Advanced Markers). También se incrusta en el build. |

Sin `VITE_GOOGLE_MAPS_KEY` el sitio usa un iframe de Google Maps.

## Docker

No meta `.env` en la imagen. Pase secretos en runtime con `env_file` o el entorno del host. La clave de Maps es un **arg de build** porque Vite la incrusta.

```bash
docker compose up --build
```

El sitio queda en `http://localhost:8787` (interfaz + `/api/contact` en un proceso).

Build manual:

```bash
docker build --build-arg VITE_GOOGLE_MAPS_KEY --build-arg VITE_GOOGLE_MAPS_MAP_ID -t rose-tech .
docker run --env-file .env -e NODE_ENV=production -e PORT=8787 -e API_HOST=0.0.0.0 -p 8787:8787 rose-tech
```

## Render

Blueprint: [`render.yaml`](./render.yaml). Conecte el repositorio de GitHub, aplique el blueprint y pegue los valores secretos en el panel (`sync: false`: no van a Git). Tras el primer despliegue, defina `FRONTEND_ORIGIN` como `https://<servicio>.onrender.com` (sin barra final) y vuelva a desplegar para CORS. Si cambia `VITE_GOOGLE_MAPS_KEY`, reconstruya la imagen Docker para que Vite la incruste.

Revise [SECURITY.md](./SECURITY.md) antes de publicar.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | API + Vite en paralelo |
| `npm run dev:web` | Solo Vite |
| `npm run dev:api` | Solo Express |
| `npm run build` | Comprueba TypeScript y genera `dist/` |
| `npm run preview` | Sirve `dist/` con proxy a la API |
| `npm start` | Producción: estáticos `dist/` + `/api` |
| `npm run docs` | Genera los PDF en `docs/` (solo local; no se versionan) |

Las versiones exactas de dependencias quedan en `package-lock.json`.

## Estructura

```
public/brand/          Activos de marca que sirven el sitio y el correo
public/images/         Fotografías de servicios
server/                API Express + plantillas de correo
src/                   Aplicación React
src/i18n/              Traducciones y proveedor de idioma
src/theme/             Tema claro / oscuro
src/data/coverage.json Polígonos de cobertura (OSM)
scripts/               Cobertura y generador de PDF
docs/                  PDF locales de `npm run docs` (fuera de Git)
Dockerfile             Imagen de producción multi-etapa
render.yaml            Blueprint de Render
```

## Internacionalización

Nueve idiomas: español (predeterminado), inglés, francés, chino simplificado, portugués de Brasil, alemán, japonés, italiano y coreano. Los textos viven en `src/i18n/locales/*.json`. El selector persiste la preferencia en `localStorage`.

## Tema

Claro y oscuro, con detección inicial de `prefers-color-scheme` y persistencia en `localStorage` (`rose-theme`). El mapa aplica estilos acordes al tema.

## Mapas y cobertura

- **Sede:** mapa de ubicación (JavaScript API con clave, o iframe).
- **Cobertura:** polígonos urbanos de municipios del Meta y un polígono departamental para servicio remoto. Los datos se generan con `scripts/fetch-coverage.mjs` hacia `src/data/coverage.json`.

## Formulario de contacto

El visitante elige un tema (diagnóstico, cotización, Myshop, productos, asesoría, mantenimiento), deja datos y mensaje. El cliente valida y envía `POST /api/contact`. El servidor vuelve a validar, aplica límite de ritmo y, si Resend está configurado:

1. Notifica a `CEO_EMAIL` (lead interno, HTML escapado).
2. Envía confirmación al visitante (salvo modo de prueba `resend.dev`).

Hay un campo honeypot oculto para bots. Los mensajes de error se renderizan como texto, no como HTML.

## Marca

Los activos en runtime viven solo en `public/brand/` (bloque de héroe, marcas de cabecera, icono de WhatsApp). Vite los copia a `dist/brand/`. El correo adjunta `logo-mark-red.png` desde disco.

## Producción

- Verifique el **dominio** en Resend; no deje `onboarding@resend.dev` como remitente público.
- Restrinja la clave de **Google Maps** por referentes HTTPS de su dominio (y localhost solo en desarrollo).
- Defina `FRONTEND_ORIGIN` con la URL real del sitio (mismo origen que el servicio en Render).
- Despliegue con `NODE_ENV=production` para no registrar datos del formulario.
- Revise [SECURITY.md](./SECURITY.md) antes de publicar.

## Licencia

Código y contenidos del sitio: uso interno de ROSE S.A.S. salvo pacto distinto.
