# Toodles Funzone

Kids play zone booking and payment app (packages, time slots, Razorpay, email/WhatsApp notifications).

## Structure

```
toodlesfunzone/
├── client/          # React frontend (Vite)
├── server/          # Express API, DB, payment, email, WhatsApp
├── shared/          # Shared schema (Drizzle, Zod)
├── scripts/         # DB scripts (seed, check, create-slots, update-hours)
├── docs/            # Documentation (deployment, payment, notifications, etc.)
├── .env.example     # Env template (copy to .env)
├── package.json
├── vite.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

## Quick start

```bash
# Copy env and set DATABASE_URL, SESSION_SECRET, Razorpay keys, etc.
cp .env.example .env

# Install and run
npm install
npm run dev
```

Open http://localhost:5000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (client + API on port 5000) |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run db:push` | Push schema (Drizzle) |
| `npm run db:check` | Check time slots and packages in DB |
| `npm run db:seed` | Seed database |
| `npm run db:create-slots` | Create hourly time slots |
| `npm run db:update-hours` | Update operating hours |

## Documentation

See **[docs/README.md](./docs/README.md)** for deployment, payment, notifications, and EC2 migration.

## Env (main)

- `DATABASE_URL` – PostgreSQL (e.g. Neon)
- `SESSION_SECRET` – Session encryption
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` – Test (local) or Live (production)
- `RAZORPAY_WEBHOOK_SECRET` – For production webhook
- `ADMIN_EMAIL` – Toodles notification email
- `SMTP_*` – Email (customer + admin notifications)
