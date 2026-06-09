# Webrand — Admin Panel

A **separate** standalone app (Vite + React 18 + TS + Tailwind) for managing the
Webrand site content. It is **not** part of the public site — it ships and deploys
on its own.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5174 (strict port)
npm run build      # tsc -b + vite build -> dist/
```

The Django API must be running on `http://localhost:8000` (default). The admin
origin `http://localhost:5174` is whitelisted in the backend's `CORS_ALLOWED_ORIGINS`.

Log in with any Django **staff/superuser** account.

## Configuration

`VITE_API_URL` — base URL of the Django API. Defaults in code to
`http://localhost:8000`; set it in the deployment environment for production.

## Auth / tokens

- `POST /api/auth/login/` → `{ access, refresh }`.
- **Refresh token** → `localStorage` (long-lived, must survive reloads).
- **Access token** → in memory only (short-lived; kept out of storage to shrink
  the XSS blast radius). On boot it is re-minted from the stored refresh.
- The fetch wrapper attaches `Authorization: Bearer <access>` and, on a `401`,
  transparently calls `POST /api/auth/refresh/` once and retries. If the refresh
  fails it clears tokens and redirects to `/login`.

## Deploy

Deploy as its **own Vercel project** (e.g. `admin.webrand.tj`), separate from the
public site. Set `VITE_API_URL` to the production API URL in that project's env.
Framework preset: Vite. Build: `npm run build`. Output: `dist/`.
