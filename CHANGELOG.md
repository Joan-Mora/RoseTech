# Changelog

All notable changes to the ROSE Technology corporate site are documented here. This file covers the **whole project journey** (product decisions and local work), not only commits that landed on GitHub.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) in spirit (`package.json` is `1.0.0`).

## [Unreleased]

### Added

- Repository [ARCHITECTURE.md](./ARCHITECTURE.md).
- Visual bilingual READMEs (shields, language switcher, no emoji) and this changelog.
- Shared `bodyLock` helper for nav drawer and brochure modal scroll locking.
- SVG icons on cards, process steps, products, why-us, team, and coverage sections.
- Catalog download control in the header / nav (`BrochureDownload`) serving `public/catalogo-rose-technology.pdf` (tracked on GitHub for deploy).
- Three-sede coverage and location UX: Villavicencio (principal), Bogotá, and Cali, with per-sede maps and OSM-derived polygons.
- `LEAD_TO` env var (comma-separated lead inboxes); `CEO_EMAIL` kept as fallback.

### Changed

- Mobile navigation lock is scoped to the hamburger breakpoint so desktop layout is not stuck after resize.
- Sections 3/4 alternate light and stronger dark banding for clearer visual rhythm.
- Sticky nav red-pill scroll-spy syncs with click navigation (smooth scroll + brief spy ignore).
- Branding and copy drop the “S.A.S.” legal suffix; the site presents **ROSE** / **ROSE Technology**.
- Coverage section layout reworked for sede selection, clearer map/hint pairing, and multi-city on-site areas.
- Contact lead routing prefers `LEAD_TO` over a single `CEO_EMAIL` inbox.

### Fixed

- Theme toggle works more reliably across browsers (including Samsung Internet Force Dark): set `data-theme` and `color-scheme` early via a boot script so light mode is not stuck dark.
- Brochure modal no longer shows a black bar under the sticky header (portal to `document.body` plus modal-open nav paint).
- Coverage map polygons stay red and the selected sede location is preserved when switching language.

### Removed

- Tracked `public/presentacion-rose-sas.pdf` (old S.A.S. presentation); catalog PDF is the downloadable asset.

## [1.0.0] — 2026-08-19

First production-shaped delivery of the institutional site for **ROSE** (trade name **ROSE Technology**), Villavicencio, Meta.

### Added

- Brochure-style single-page site derived from the commercial PDF: hero, about, services, Myshop, products, team, coverage, contact, footer, cookie notice, and JSON-LD `LocalBusiness`.
- Brand kit in `public/brand/` (hero block, header marks, WhatsApp icon) used by the UI and mail. Palette black / white / `#e10600`.
- Contact pipeline: closed business topics, client + server validation, honeypot, Resend lead to `CEO_EMAIL` and visitor confirmation (HTML escaped; logo CID).
- Google Maps for HQ (`LocationMap`) with iframe fallback, and Meta coverage map (`CoverageMap`) from OSM-derived GeoJSON (`scripts/fetch-coverage.mjs` → `src/data/coverage.json`): urban cores for on-site service and the department polygon for remote support.
- Internationalization: nine locales (Spanish default, plus English, French, Simplified Chinese, Brazilian Portuguese, German, Japanese, Italian, Korean) with `localStorage` persistence.
- Light / dark theme (`ThemeProvider`), first-visit `prefers-color-scheme`, `rose-theme` persistence, theme-aware maps and logos, anti-flash script in `index.html`.
- Security controls: Helmet, CORS allowlist, JSON body cap, rejected unknown fields, rate limit on `POST /api/contact`, production logs without PII, CSP/referrer on Vite and `index.html`, [SECURITY.md](./SECURITY.md).
- Production packaging: multi-stage Docker image, Compose, Render blueprint (`render.yaml`) on the **free** plan, one Node process serving `dist/` + `/api`, `GET /api/health`.
- Bilingual README and `.env.example` (variable **names** only).

### Changed

- Form topics use stable ids (labels translate); server accepts id or legacy local label.
- Mail and Maps stay on opposite sides of the trust boundary: Resend never uses `VITE_*`; Maps keys are public and must be referrer-restricted.
- Brand assets consolidated in `public/brand/` (Vite copies them to `dist/brand/`).

### Fixed

- Contact form rendering of errors as text nodes (no user HTML).
- Maps fallback when the JavaScript API key is missing or rejected.
- Mobile overlay: body scroll lock while the drawer is open; cookie banner hidden under the lock.
- Same-origin production contact posts (`PORT` / `API_HOST` / `FRONTEND_ORIGIN` for CORS when the public origin must be listed).

### Security

- Secrets only in root `.env` (gitignored). No `src/.env`. Dashboard values in Render are `sync: false`.
- Rate limit defaults: 5 submissions per IP per 15 minutes.
- Trust proxy enabled in Docker/Render so rate limiting sees the visitor IP.

[Unreleased]: https://github.com/Joan-Mora/RoseTech
[1.0.0]: https://github.com/Joan-Mora/RoseTech/commits/main
