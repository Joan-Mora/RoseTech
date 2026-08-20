<p align="center">
  <img src="public/brand/logo-hero.png" alt="ROSE Technology" height="72">
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/EN-English-111111?style=for-the-badge" alt="English"></a>
  <a href="README.es.md"><img src="https://img.shields.io/badge/ES-Español-e10600?style=for-the-badge" alt="Español"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 20">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render">
  <img src="https://img.shields.io/badge/Licencia-Privada-e10600?style=for-the-badge" alt="Licencia privada">
</p>

# ROSE Technology — Sitio corporativo

Sitio web institucional de **ROSE** (marca comercial **ROSE Technology**), centro de reparación y optimización de sistemas empresariales con sedes en **Villavicencio**, **Bogotá** y **Cali**, Colombia.

Presenta la oferta de servicio técnico, el software administrativo **Myshop**, productos tecnológicos, mapas de cobertura multi-sede, descarga del **catálogo** PDF y un canal de contacto que notifica al equipo por correo (`LEAD_TO`).

<p>
  <a href="ARCHITECTURE.md"><img src="https://img.shields.io/badge/Arquitectura-070707?style=flat-square" alt="Arquitectura"></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/Seguridad-e10600?style=flat-square" alt="Seguridad"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/Changelog-5c524f?style=flat-square" alt="Changelog"></a>
</p>

---

## <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" alt=""> Stack

| Capa | Tecnología |
| --- | --- |
| Interfaz | [Vite](https://vitejs.dev/) + [React](https://react.dev/) 19 + TypeScript |
| Estilos | CSS propio, paleta corporativa (negro, blanco, rojo `#e10600`) |
| API de contacto | [Express](https://expressjs.com/) 5 (`server/index.mjs`) |
| Correo | [Resend](https://resend.com/) (clave **solo en el servidor**) |
| Mapas | Google Maps JavaScript API / iframe Embed si no hay clave |
| i18n | `I18nProvider` propio + JSON (**no** i18next) |
| Producción | Docker / Render **free**: un proceso Node sirve `dist/` + `/api` |

Decisiones de diseño, mapa de carpetas y flujo de datos: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="20" height="20" alt=""> Cómo ejecutarlo (local)

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

---

## <img src="https://cdn.simpleicons.org/dotenv/ECD53F" width="20" height="20" alt=""> Variables de entorno

Definidas en `.env.example`. **No** copie claves reales a README, issues, PDFs ni `render.yaml`.

### Servidor (secretos)

| Variable | Propósito |
| --- | --- |
| `RESEND_API_KEY` | Clave de la API de Resend. Solo la lee Node. Nunca `VITE_*`. |
| `RESEND_FROM` | Remitente. En producción use un dominio **verificado** en Resend. |
| `LEAD_TO` | Destinatarios internos del lead (lista separada por coma; preferido). |
| `CEO_EMAIL` | Reserva si no hay `LEAD_TO` (un correo o lista separada por coma). |
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

---

## <img src="https://cdn.simpleicons.org/docker/2496ED" width="20" height="20" alt=""> Docker

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

---

## <img src="https://cdn.simpleicons.org/render/46E3B7" width="20" height="20" alt=""> Render

Blueprint: [`render.yaml`](./render.yaml) (Docker, plan **free**). Conecte el repositorio de GitHub, aplique el blueprint y pegue los secretos en el panel (`sync: false`: no van a Git): `RESEND_*`, `LEAD_TO` (preferido) o `CEO_EMAIL`, `VITE_GOOGLE_MAPS_*`, `FRONTEND_ORIGIN`. Fijos en Git: `NODE_ENV`, `TRUST_PROXY`, `API_HOST`. Tras el primer despliegue, defina `FRONTEND_ORIGIN` como `https://<servicio>.onrender.com` (sin barra final) y **vuelva a desplegar** para CORS. Si cambia `VITE_GOOGLE_MAPS_KEY`, reconstruya la imagen Docker para que Vite la incruste.

Revise [SECURITY.md](./SECURITY.md) antes de publicar.

---

## <img src="https://cdn.simpleicons.org/gnubash/4EAA25" width="20" height="20" alt=""> Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | API + Vite en paralelo |
| `npm run dev:web` | Solo Vite |
| `npm run dev:api` | Solo Express |
| `npm run build` | Comprueba TypeScript y genera `dist/` |
| `npm run preview` | Sirve `dist/` con proxy a la API |
| `npm start` | Producción: estáticos `dist/` + `/api` |

Las versiones exactas de dependencias quedan en `package-lock.json`.

---

## <img src="https://cdn.simpleicons.org/git/e10600" width="20" height="20" alt=""> Estructura

```
public/brand/                       Activos de marca (sitio y correo)
public/catalogo-rose-technology.pdf Catálogo descargable (va al deploy)
public/images/                      Fotografías de servicios
server/                             API Express + plantillas (LEAD_TO)
src/                                Aplicación React
src/content.ts                      COMPANY + tres SEDES (direcciones HQ)
src/i18n/                           I18nProvider propio + JSON de idioma
src/theme/                          Tema claro / oscuro
src/data/coverage.json              Polígonos por sede (OSM)
scripts/                            Cobertura OSM
Dockerfile                          Imagen de producción multi-etapa
render.yaml                         Blueprint Render (plan free)
ARCHITECTURE.md                     Arquitectura del sistema (GitHub)
```

Solo local (gitignored): `docs/*.pdf` y `scripts/generate-docs.mjs`.

---

## Internacionalización

Nueve idiomas: español (predeterminado), inglés, francés, chino simplificado, portugués de Brasil, alemán, japonés, italiano y coreano. `I18nProvider` propio + `src/i18n/locales/*.json` (**no** i18next). El selector persiste la preferencia en `localStorage`.

## Tema

Claro y oscuro, con detección inicial de `prefers-color-scheme` y persistencia en `localStorage` (`rose-theme`). Un script temprano en `index.html` fija `data-theme` y `color-scheme` antes del pintado (ayuda con Samsung Internet Force Dark y similares). El mapa aplica estilos acordes al tema.

## Mapas y cobertura

Tres sedes (selector en ubicación y cobertura):

| Sede | HQ | Cobertura |
| --- | --- | --- |
| Villavicencio | Cra. 39 #10 51 | Presencial (municipios del Meta) + remoto (departamento) |
| Bogotá | Cra. 120 #17F-63, Fontibón | Solo ciudad |
| Cali | Cra. 5 #7 32, COMUNA 3 | Solo ciudad |

- **Ubicación:** JavaScript API con clave, o iframe; el cambio de idioma **no remonta** el mapa (se conserva la sede).
- **Cobertura:** GeoJSON con `scripts/fetch-coverage.mjs` → `src/data/coverage.json`.

## Catálogo

Cabecera / nav / pie usan `BrochureDownload` con `public/catalogo-rose-technology.pdf` (versionado para el deploy). Sustituye la antigua presentación.

## Formulario de contacto

El visitante elige un tema (diagnóstico, cotización, Myshop, productos, asesoría, mantenimiento), deja datos y mensaje. El cliente valida y envía `POST /api/contact`. El servidor vuelve a validar, aplica límite de ritmo y, si Resend está configurado:

1. Notifica a todas las direcciones de `LEAD_TO` (preferido; coma-separadas) o `CEO_EMAIL` de reserva en un solo envío (HTML escapado).
2. Envía confirmación al visitante (salvo modo de prueba `resend.dev`).

Hay un campo honeypot oculto para bots. Los mensajes de error se renderizan como texto, no como HTML.

## Marca

Los activos en runtime viven solo en `public/brand/` (bloque de héroe, marcas de cabecera, icono de WhatsApp). Vite los copia a `dist/brand/`. El correo adjunta `logo-mark-red.png` desde disco. Marca: **ROSE** / **ROSE Technology** (sin sufijo “S.A.S.”).

## Producción

- Verifique el **dominio** en Resend; no deje `onboarding@resend.dev` como remitente público.
- Restrinja la clave de **Google Maps** por referentes HTTPS de su dominio (y localhost solo en desarrollo).
- Defina `FRONTEND_ORIGIN` con la URL real del sitio (mismo origen que el servicio en Render).
- Despliegue con `NODE_ENV=production` para no registrar datos del formulario.
- Revise [SECURITY.md](./SECURITY.md) antes de publicar.

## Licencia

No hay licencia open source publicada. Código y contenidos del sitio: **uso interno de ROSE** salvo pacto distinto.
