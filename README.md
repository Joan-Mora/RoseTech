[English](README.md) | [Español](README.es.md)

# ROSE Technology — corporate site

Institutional website for **ROSE S.A.S.** (trade name **ROSE Technology**), a business systems repair and optimization center in Villavicencio, Meta, Colombia.

The site presents technical service, the **Myshop** admin product, hardware, territorial coverage, and a contact channel that emails the team.

## Stack

| Layer | Technology |
| --- | --- |
| UI | [Vite](https://vitejs.dev/) + [React](https://react.dev/) 19 + TypeScript |
| Styles | Custom CSS, brand palette (black, white, red `#e10600`) |
| Contact API | [Express](https://expressjs.com/) 5 (`server/index.mjs`) |
| Mail | [Resend](https://resend.com/) (key **only on the server**) |
| Maps | Google Maps JavaScript API / Embed iframe if no key |
| Production | One Node process: static `dist/` + `POST /api/contact` |

## How to run (local)

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

Regenerate project PDFs locally (gitignored; they are **not** in the GitHub repo):

```bash
npm run docs
```

## Environment variables

Names and purpose live in `.env.example`. **Never** copy real keys into README, issues, PDFs, or `render.yaml`.

### Server (secrets)

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. Node only. Never `VITE_*`. |
| `RESEND_FROM` | Sender. In production use a domain **verified** in Resend. |
| `CEO_EMAIL` | Internal inbox for each lead. |
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

## Docker

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

## Render

Blueprint: [`render.yaml`](./render.yaml). Connect the GitHub repo, apply the blueprint, paste secret values in the dashboard (they are `sync: false` — not stored in Git). After the first deploy, set `FRONTEND_ORIGIN` to `https://<service>.onrender.com` (no trailing slash) and trigger a **redeploy** so CORS matches. If you add or change `VITE_GOOGLE_MAPS_KEY`, rebuild the Docker image so Vite can inline it.

See [SECURITY.md](./SECURITY.md) before going live.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API + Vite in parallel |
| `npm run dev:web` | Vite only |
| `npm run dev:api` | Express only |
| `npm run build` | TypeScript check and `dist/` |
| `npm run preview` | Serves `dist/` with proxy to the API |
| `npm start` | Production: static `dist/` + `/api` |
| `npm run docs` | Generates PDFs locally in `docs/` (not committed) |

Exact dependency versions are in `package-lock.json`.

## Layout

```
public/brand/          Brand assets the site and email use
public/images/         Service photos
server/                Express API + mail templates
src/                   React app
src/i18n/              Translations and locale provider
src/theme/             Light / dark theme
src/data/coverage.json Coverage polygons (OSM)
scripts/               Coverage fetch, PDF generator
docs/                  Local PDFs from `npm run docs` (gitignored)
Dockerfile             Multi-stage production image
render.yaml            Render blueprint
```

## Internationalization

Nine languages: Spanish (default), English, French, Simplified Chinese, Brazilian Portuguese, German, Japanese, Italian, and Korean. Copy lives in `src/i18n/locales/*.json`. The picker stores the preference in `localStorage`.

## Theme

Light and dark, with initial `prefers-color-scheme` and persistence in `localStorage` (`rose-theme`). The map styles follow the theme.

## Maps and coverage

- **HQ:** location map (JavaScript API with a key, or iframe).
- **Coverage:** urban polygons for Meta municipalities plus a departmental polygon for remote service. Data is generated with `scripts/fetch-coverage.mjs` into `src/data/coverage.json`.

## Contact form

The visitor picks a topic (diagnosis, quote, Myshop, products, advisory, maintenance), leaves details, and a message. The client validates and sends `POST /api/contact`. The server validates again, rate-limits, and if Resend is configured:

1. Notifies `CEO_EMAIL` (internal lead, escaped HTML).
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

Site code and content: internal use by ROSE S.A.S. unless otherwise agreed.
