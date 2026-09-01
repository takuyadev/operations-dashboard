# operations-dashboard

https://github.com/user-attachments/assets/5e0902e1-e88e-4f1a-ac3e-32a54e257d91

Real-time road-incident monitoring for a traffic operations centre: operators
watch incoming events, review them against CCTV and sensor data, and dispatch
response teams.

# Research
If you would like to see all research, development process, and AI chat logs, please view documentation included in [/research](https://github.com/takuyadev/operations-dashboard/tree/main/research) folder.

## Features

- Admin dashboard for operations-centre staff
- Emits an event when the backend detects a potential road emergency
- Surfaces the dispatch decision for a response team
- Visibility first — the unresolved queue stays front and centre

**Event details:** priority · location · snapshot image · description of what was detected
**Situations:** traffic accident · debris on road · wrong-way vehicle

## Structure

Monorepo managed with **pnpm workspaces** + **Turborepo**. No authentication —
this is a proof of concept.

| Package                      | What                                    | Dev port      |
| ---------------------------- | --------------------------------------- | ------------- |
| [`apps/client`](apps/client) | React Router (SSR) dashboard            | 5173          |
| [`apps/server`](apps/server) | Express + Prisma API + WebSocket feed   | 4000          |
| `postgres` (Docker)          | PostgreSQL 16                           | 5433 → 5432   |

## Run with Docker

**1. Create and run application container via Docker**
```bash
docker compose up -d
```

**2. Seed the database**
```bash
docker compose exec app pnpm --filter server db:seed
```

## Configuration

`apps/server/.env` (copy from `apps/server/.env.example`):

| Var            | Default                                                             |
| -------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://user:password@localhost:5433/operations-dashboard` |
| `PORT`         | `4000`                                                            |

The client reads two optional overrides (defaults work out of the box):
`API_URL` (`http://localhost:4000`) and `PUBLIC_WS_URL` (`ws://localhost:4000/ws`).
All four vars are listed in `turbo.json` `globalEnv` so Turbo forwards them to
tasks.

Postgres is published on host port **5433** (not 5432) to avoid clashing with a
local Postgres install. Inside Docker, containers reach it at `postgres:5432`.
