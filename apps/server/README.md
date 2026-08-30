# server

Express + Prisma API for the operations dashboard, with a WebSocket feed that
broadcasts when incidents change. No authentication — every endpoint is open.

## Stack

- **Express 5** — HTTP/REST
- **Prisma 6** — Postgres access (the `postgres` service in `docker-compose.yaml`)
- **ws** — WebSocket server mounted at `/ws`
- **tsx** — TypeScript execution / watch in dev

## Run

From the repo root, `pnpm dev` starts the client and this server together via
Turbo. Postgres must be up first:

```bash
docker compose up -d postgres   # publishes 5432 to localhost
pnpm install
pnpm dev                        # client :5173, server :4000
```

Server only:

```bash
pnpm --filter server dev        # runs `prisma db push` then `tsx watch`
pnpm --filter server db:seed    # load the fixture data
```

`DATABASE_URL` and `PORT` come from `apps/server/.env` (see `.env.example`).

## REST

Base URL `http://localhost:4000`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | liveness + `SELECT 1` |
| GET | `/api/incidents` | filters: `?status=` `?priority=` `?assignedToMe=true` |
| POST | `/api/incidents` | creates an incident, emits `incident:created` |
| GET | `/api/incidents/:id` | incident + its activity |
| PATCH | `/api/incidents/:id` | partial update, emits `incident:updated` |
| DELETE | `/api/incidents/:id` | emits `incident:deleted` |
| GET | `/api/incidents/:id/activity` | activity for one incident |
| POST | `/api/incidents/:id/activity` | append an event, emits `activity:created` |
| GET | `/api/activity` | global feed, `?take=` (max 200) |

Create example:

```bash
curl -X POST http://localhost:4000/api/incidents \
  -H 'content-type: application/json' \
  -d '{"summary":"Debris in lane 2","location":"Route 246 · Shibuya","detail":"Pallet in the center lane.","priority":"high"}'
```

## WebSocket

Connect to `ws://localhost:4000/ws`. On connect the server sends
`{"type":"connected"}`. After that every change is pushed as JSON:

```jsonc
{ "type": "incident:created", "data": { /* incident + activity */ } }
{ "type": "incident:updated", "data": { /* incident */ } }
{ "type": "incident:deleted", "data": { "id": 12345 } }
{ "type": "activity:created", "data": { /* activity event */ } }
```

Send the string `ping` to get `pong` back.

Quick check:

```bash
node -e "const ws=new WebSocket('ws://localhost:4000/ws');ws.onmessage=e=>console.log(e.data)"
```

## Schema

`Incident` and `ActivityEvent` in `prisma/schema.prisma`, matching the UI
contract in `apps/client/app/data/incidents.ts`. First iteration uses
`prisma db push` (no migration history); switch to `prisma migrate` when the
shape settles.
