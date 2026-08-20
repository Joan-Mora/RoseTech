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
  <img src="https://img.shields.io/badge/License-Proprietary-e10600?style=for-the-badge" alt="Proprietary">
</p>

# ROSE Technology — corporate site

Institutional website for **ROSE** (trade name **ROSE Technology**), a business systems repair and optimization center in Villavicencio, Meta, Colombia.

The site presents technical service, the **Myshop** admin product, hardware, territorial coverage, and a contact channel that emails the team.

<p>
  <a href="ARCHITECTURE.md"><img src="https://img.shields.io/badge/Architecture-070707?style=flat-square" alt="Architecture"></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/Security-e10600?style=flat-square" alt="Security"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/Changelog-5c524f?style=flat-square" alt="Changelog"></a>
</p>

---

## <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" alt=""> Stack

| Layer | Technology |
| --- | --- |
| UI | [Vite](https://vitejs.dev/) + [React](https://react.dev/) 19 + TypeScript |
| Styles | Custom CSS, brand palette (black, white, red `#e10600`) |
| Contact API | [Express](https://expressjs.com/) 5 (`server/index.mjs`) |
| Mail | [Resend](https://resend.com/) (key **only on the server**) |
| Maps | Google Maps JavaScript API / Embed iframe if no key |
| Production | One Node process: static `dist/` + `POST /api/contact` |

Design decisions, folder map, and data flow: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="20" height="20" alt=""> How to run (local)

Requires Node.js 20 or later.

```bash
npm install
```

Copy `.env.example` to `.env` at the **repository root** and fill in the variables. Do not create `src/.env` and do not prefix secrets with `VITE_`.

```bash
npm run dev
```

That command starts **two processes**:

- Contact API at `http://127.0.0.1:8787`
- Vite; `/api` is proxied to Express

Static build (frontend only):

```bash
npm run build
npm run preview
```

`npm run preview` serves the frontend and still proxies `/api` to a separately running API. Production uses `npm start` (or Docker) so **one process** serves `dist/` and the API.

---

## <img src="https://cdn.simpleicons.org/dotenv/ECD53F" width="20" height="20" alt=""> Environment variables

Names and purpose live in `.env.example`. **Never** copy real keys into README, issues, PDFs, or `render.yaml`.

### Server (secrets)

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. Node only. Never `VITE_*`. |
| `RESEND_FROM` | Sender. In production use a domain **verified** in Resend. |
| `LEAD_TO` | Comma-separated internal inboxes for each lead (preferred). |
| `CEO_EMAIL` | Fallback if `LEAD_TO` is unset (single address or comma-separated list). |
| `PORT` | HTTP port in production (Render sets this). Default `8787`. |
| `API_PORT` | Local API port if `PORT` is unset (default `8787`). |
| `API_HOST` | Bind address (`127.0.0.1` locally; `0.0.0.0` in Docker/Render). |
| `FRONTEND_ORIGIN` | Extra CORS origins (comma-separated), besides Vite localhost. Set to the Render URL after the first deploy. |
| `RATE_LIMIT_WINDOW_MS` | Window for `POST /api/contact` (ms). Default 15 min. |
| `RATE_LIMIT_MAX` | Max submissions per IP in that window. Default 5. |
| `TRUST_PROXY` | Set `1` behind a reverse proxy so `X-Forwarded-For` is trusted. |
| `NODE_ENV` | Use `production` in Docker/Render (hides form PII from logs). |

### Client (intentionally public)

| Variable | Purpose |
| --- | --- |
| `VITE_GOOGLE_MAPS_KEY` | Maps key. It is baked into the browser bundle. **Restrict by HTTP referrer** and, if possible, only Maps JavaScript API and Maps Embed API. Required at **Vite / Docker build** time. |
| `VITE_GOOGLE_MAPS_MAP_ID` | Optional Map ID (styles / Advanced Markers). Also a build-time `VITE_*` value. |

Without `VITE_GOOGLE_MAPS_KEY` the site uses a Google Maps iframe.

---

## <img src="https://cdn.simpleicons.org/docker/2496ED" width="20" height="20" alt=""> Docker

Do not bake `.env` into the image. Pass runtime secrets with `env_file` or the host environment. The Maps key is an **image build arg** because Vite inlines it.

```bash
docker compose up --build
```

The site is then at `http://localhost:8787` (UI + `/api/contact` in one process).

Manual build:

```bash
docker build --build-arg VITE_GOOGLE_MAPS_KEY --build-arg VITE_GOOGLE_MAPS_MAP_ID -t rose-tech .
docker run --env-file .env -e NODE_ENV=production -e PORT=8787 -e API_HOST=0.0.0.0 -p 8787:8787 rose-tech
```

---

## <img src="https://cdn.simpleicons.org/render/46E3B7" width="20" height="20" alt=""> Render

Blueprint: [`render.yaml`](./render.yaml). Connect the GitHub repo, apply the blueprint, paste secret values in the dashboard (they are `sync: false` — not stored in Git). After the first deploy, set `FRONTEND_ORIGIN` to `https://<service>.onrender.com` (no trailing slash) and trigger a **redeploy** so CORS matches. If you add or change `VITE_GOOGLE_MAPS_KEY`, rebuild the Docker image so Vite can inline it.

See [SECURITY.md](./SECURITY.md) before going live.

---

## <img src="https://cdn.simpleicons.org/gnubash/4EAA25" width="20" height="20" alt=""> Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API + Vite in parallel |
| `npm run dev:web` | Vite only |
| `npm run dev:api` | Express only |
| `npm run build` | TypeScript check and `dist/` |
| `npm run preview` | Serves `dist/` with proxy to the API |
| `npm start` | Production: static `dist/` + `/api` |

Exact dependency versions are in `package-lock.json`.

---

## <img src="https://cdn.simpleicons.org/git/e10600" width="20" height="20" alt=""> Layout

```
public/brand/          Brand assets the site and email use
public/images/         Service photos
server/                Express API + mail templates
src/                   React app
src/i18n/              Translations and locale provider
src/theme/             Light / dark theme
src/data/coverage.json Coverage polygons (OSM)
scripts/               Coverage fetch
Dockerfile             Multi-stage production image
render.yaml            Render blueprint
ARCHITECTURE.md        System architecture (GitHub)
```

---

## Internationalization

Nine languages: Spanish (default), English, French, Simplified Chinese, Brazilian Portuguese, German, Japanese, Italian, and Korean. Copy lives in `src/i18n/locales/*.json`. The picker stores the preference in `localStorage`.

## Theme

Light and dark, with initial `prefers-color-scheme` and persistence in `localStorage` (`rose-theme`). The map styles follow the theme.

## Maps and coverage

- **HQ:** location map (JavaScript API with a key, or iframe).
- **Coverage:** urban polygons for Meta municipalities plus a departmental polygon for remote service. Data is generated with `scripts/fetch-coverage.mjs` into `src/data/coverage.json`.

## Contact form

The visitor picks a topic (diagnosis, quote, Myshop, products, advisory, maintenance), leaves details, and a message. The client validates and sends `POST /api/contact`. The server validates again, rate-limits, and if Resend is configured:

1. Notifies every address in `LEAD_TO` (or `CEO_EMAIL` fallback) in one send (escaped HTML).
2. Sends a confirmation to the visitor (except `resend.dev` test mode).

A hidden honeypot field catches bots. Error messages are rendered as text, not HTML.

## Brand

Runtime assets live only in `public/brand/` (hero block, header marks, WhatsApp icon). Vite copies them to `dist/brand/`. Email attaches `logo-mark-red.png` from disk.

## Production checklist

- Verify the **domain** in Resend; do not leave `onboarding@resend.dev` as the public sender.
- Restrict the **Google Maps** key to HTTPS referrers of your domain (localhost only for development).
- Set `FRONTEND_ORIGIN` to the real site URL (same origin as the Render service).
- Deploy with `NODE_ENV=production` so form data is not logged.
- Review [SECURITY.md](./SECURITY.md) before publishing.

## License

No public open-source license is published. Site code and content are for **internal use by ROSE** unless otherwise agreed.
