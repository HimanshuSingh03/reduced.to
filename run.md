# Local Run Guide

Follow these commands from the repo root to start everything locally. If you restart your shell, re‑apply the same env vars.

## 1) Ensure Node 20 on PATH
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

## 2) Start Postgres (on port 5433)
```bash
pg_ctl -D /tmp/reduced_to_pg -o "-p 5433" -l /tmp/reduced_to_pg/logfile start
# Stop: pg_ctl -D /tmp/reduced_to_pg stop
```

## 3) Environment
```bash
cp -n .example.env .env  # already created in this repo; keeps existing .env intact
# .env expects DATABASE_URL pointing at port 5433 (already set)
```

## 4) Run backend (NestJS on 3000)
```bash
NX_DAEMON=false npx nx serve backend
# or after building: NODE_ENV=development node dist/apps/backend/main.js
```

## 5) Run frontend (Qwik/Vite on 4200)
```bash
NX_DAEMON=false npx nx serve frontend --host=127.0.0.1 --port=4200
```

## 6) Open the app
- Backend API: http://localhost:3000
- Frontend: http://127.0.0.1:4200

## 7) Stop Postgres when done
```bash
pg_ctl -D /tmp/reduced_to_pg stop
```

## Notes
- Prisma migrations are already applied. To re-run: `npx nx migrate-dev prisma --name init`
- Nx daemon is disabled (socket permission issue); keep `NX_DAEMON=false` in commands.
- If ports 3000/4200/5433 are busy, adjust in `.env` and the start commands. 
