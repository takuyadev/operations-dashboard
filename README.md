# operations-dashboard

Real-time road-incident monitoring for a traffic operations centre: operators
watch incoming events, review them against CCTV and sensor data, and dispatch
response teams.

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

```bash
docker compose up -d
```

Starts Postgres and the `app` container, which runs the client and server
together via `pnpm dev`. Then open <http://localhost:5173>.

Load fixture data once the database is up:

```bash
docker compose exec app pnpm --filter server db:seed
```

## Run locally with pnpm

Preferred for development — faster reloads, only Postgres in Docker:

```bash
docker compose up -d postgres      # publishes container 5432 on host port 5433
pnpm install
pnpm --filter server db:seed       # one-time fixture load
pnpm dev                           # client :5173 + server :4000, via Turbo
```

| Command                                | Does                                    |
| -------------------------------------- | --------------------------------------- |
| `pnpm dev`                             | run client + server in watch mode       |
| `pnpm build`                           | build both apps                         |
| `pnpm --filter server db:seed`         | load fixtures (skips if data exists)    |
| `pnpm --filter server db:seed:force`   | wipe and reload fixtures                |
| `pnpm --filter server prisma:studio`   | browse the database                     |

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

## More

- [`apps/server/README.md`](apps/server/README.md) — API architecture and module layout
- The server's endpoints are self-documented at `GET http://localhost:4000/`
