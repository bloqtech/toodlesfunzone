# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Toodles Funzone is a full-stack web app (React + Express + PostgreSQL) for an indoor kids play zone booking platform. Single monolithic service running on port 5000 in dev mode. See `replit.md` for architecture details.

### Services

| Service | How to run | Notes |
|---|---|---|
| App server (Express + Vite HMR) | `npm run dev` | Serves both API and frontend on port 5000 |
| PostgreSQL (Neon serverless) | Remote — configured via `DATABASE_URL` in `.env` | Uses `@neondatabase/serverless` driver (WebSocket-based); local PG won't work without a WS proxy |

### Key commands

- **Dev server**: `npm run dev` (port 5000)
- **Type check**: `npm run check` (pre-existing TS errors in `client/src/hooks/usePermissions.ts` and `client/src/pages/admin/users.tsx`)
- **DB schema push**: `npm run db:push`
- **DB seed**: `npm run db:seed`
- **Build**: `npm run build`

### Non-obvious caveats

- The `.env` file ships with a Neon `DATABASE_URL`. The `@neondatabase/serverless` driver connects via WebSocket (`wss://`), so a plain local PostgreSQL instance will **not** work as a drop-in replacement. If local PG is needed, a WebSocket proxy (e.g. `@neondatabase/wsproxy`) must be configured.
- The `.env` line `NODE_ENV === 'development'` is not valid env syntax; it's harmless because `cross-env NODE_ENV=development` in the dev script sets it correctly.
- Admin login: username `raspik2025`, password `admin123` (seeded via `npm run db:seed`). Login route: `/admin/login`.
- No ESLint/Prettier config files exist in the repo despite the docs mentioning them.
- No automated test framework or test suite is present.
- Optional integrations (Google OAuth, Razorpay, Cloudinary, SMTP, WhatsApp) degrade gracefully when their env vars are empty.
