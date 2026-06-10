# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

A monorepo with **three independently-deployed apps** that talk over an HTTP API:

| Dir | What | Stack | Dev port |
|---|---|---|---|
| `backend/` | REST API + data + Django admin | Django 6 + DRF, SQLite (local), JWT | 8000 |
| `frontend/` | Public marketing site (Webrand) | React 18 + Vite + TS + Tailwind + Framer Motion | 5173 |
| `admin-panel/` | Internal CMS for site content | React 18 + Vite + TS + Tailwind | 5174 |

Each app has its own deeper docs — **read these before working in that app**:
`frontend/CLAUDE.md` (public-site architecture + the local-dev server rule), `admin-panel/README.md` (auth/token model + deploy).

The two frontends are separate Vite apps with their own `package.json`; there is no shared workspace/root `package.json`. The brand identity is duplicated intentionally (same `brand.50–900` scale anchored to `#2B5ED3` = `brand-600`, Manrope font) so each app ships alone.

## Commands

**Backend** (run from `backend/`, using the venv interpreter that owns `manage.py` — Windows):
```bash
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py seed            # idempotent: loads 6 vacancies + 14 projects (+logos) from content.ts data
.venv/Scripts/python.exe manage.py createsuperuser # needed to log into the admin panel / Django admin
.venv/Scripts/python.exe manage.py runserver 8000
```
Secrets come from `backend/.env` via `python-decouple` (see `.env.example`). There is **no backend test suite** and no linter configured.

**Frontends** (`frontend/` and `admin-panel/`):
```bash
npm install
npm run dev      # frontend: 5173 · admin-panel: 5174 (strictPort)
npm run build    # tsc -b (typecheck, strict) then vite build
```
`npm run build` is the **only correctness gate** for both — there are no tests. It fails on TS errors but NOT on unused vars (`noUnusedLocals`/`noUnusedParameters` are off).

### Local dev server rule (important)
The public Vite on **5173 is started and owned by the human** (HMR). Do **not** run `npm run dev`/`preview` for `frontend/`, and never touch 5173 — see `frontend/CLAUDE.md`. The `admin-panel/` dev server (5174) is fine to start yourself. You may run the Django server (8000) for testing.

## Architecture — the big picture

### Backend (`backend/`, project `config/`, apps under `apps/`)
- **`apps/catalog`** — `Vacancy` (PK = `slug`) and `Project` (logo `ImageField`). Both exposed as DRF `ModelViewSet`s: **GET is public, writes require `IsAdminUser`** (the `ReadOnlyOrAdmin` permission). Anonymous reads see only `is_published=True`; staff see drafts too (`get_queryset` branches on `request.user.is_staff`). `ProjectViewSet` accepts multipart so the logo can be uploaded as a file and is serialized back as an **absolute URL** (`ProjectSerializer.to_representation`).
- **`apps/leads`** — single `Lead` model with `kind ∈ {lead, application}`. `POST /api/leads/` is **public** intake: server-side validation, a `company` honeypot (filled → silent 200, no save), `AnonRateThrottle` (`leads` scope, 5/min), and **fail-safe Telegram delivery** (`telegram.py` never raises; lead is saved even if the token is missing/the call fails; applications route to `TELEGRAM_APPLICATIONS_CHAT_ID` if set). `GET /api/leads/journal/` is an **admin-only** read endpoint added for the admin panel; the public POST is untouched.
- **Auth** — `djangorestframework-simplejwt`. `POST /api/auth/login/` → `{access, refresh}`, `POST /api/auth/refresh/` → new access. DRF `DEFAULT_AUTHENTICATION_CLASSES` = JWT + Session (Session keeps Django admin working). Access ~60 min, refresh ~7 days.

### Cross-app contracts (the non-obvious coupling)
These string sets are a contract enforced in multiple places — changing one means changing the others:
- **Vacancy `slug` ↔ frontend `Vacancy.id`.** The API serializes `slug`; both frontends map `slug → id`. Applying to a vacancy POSTs `{kind:'application', role: <slug>}`.
- **Quiz direction ids.** `frontend/src/components/ContactForm.tsx` `DIRECTIONS` (`smm/design/dev/ads/unsure`) must match `KNOWN_SELECTED` in `backend/apps/leads/serializers.py`, or valid leads 400.
- **Constrained vocab.** Vacancy `icon` ∈ 6 lucide names, `accent` ∈ `brand-500/600/700`; Project `category` ∈ `Разработка|SMM`. Defined in `backend/apps/catalog/models.py` (`*_CHOICES`) and mirrored in `frontend` icon/accent maps + `admin-panel/src/lib/options.ts`. The admin form offers exactly these.
- **CORS.** `CORS_ALLOWED_ORIGINS` whitelists the two frontend dev origins (5173, 5174) + the prod domain.

### Frontends → API
Both use `const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'` (default in code so HMR picks it up; set `VITE_API_URL` per Vercel project in prod).
- **Public site** fetches vacancies (`/api/vacancies/`) and projects (`/api/projects/`) from the API; the rest of the page data (services, partners, contacts, nav) still lives in `frontend/src/data/content.ts`. Contact form and "Откликнуться" POST to `/api/leads/`. (Details: `frontend/CLAUDE.md`.)
- **Admin panel** is JWT-gated CRUD: refresh token in `localStorage`, access token **in memory** (re-minted from refresh on boot); the `api/client.ts` fetch wrapper attaches `Bearer` and transparently refreshes + retries once on a `401`, else logs out. Forms are right-side drawers; project edits send multipart for the logo. (Details: `admin-panel/README.md`.)

## Deploy
Three separate targets: the public site and the admin panel each deploy as their **own** Vercel project (admin e.g. `admin.webrand.tj`) with their own `VITE_API_URL`; the backend deploys separately (gunicorn + Postgres via `DATABASE_URL`, object storage for media). The admin panel never ships with the public site.
