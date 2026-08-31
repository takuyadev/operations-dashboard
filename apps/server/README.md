# server

The operations-dashboard REST API and realtime feed: Express 5 + Prisma 6 over
PostgreSQL, with a WebSocket that broadcasts on every incident change. No
authentication — this is a proof of concept and every endpoint is open.

> Running the stack (Docker, `pnpm dev`, seeding, environment) lives in the
> [root README](../../README.md). This file is only about how the server is
> organised.

## Stack

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| HTTP / routing | Express 5                       |
| Database       | Prisma 6 → PostgreSQL           |
| Realtime       | `ws`, mounted at `/ws`          |
| Dev runtime    | `tsx watch`                     |

## Layout

```
src/
  index.ts                 entrypoint — createApp(), attach WebSocket, listen
  app.ts                   Express app: middleware, /api mount, error handler
  lib/
    prisma.ts              shared PrismaClient
    events.ts              in-process pub/sub bus (publish / onEvent)
    http.ts                ApiError, parseId
  realtime/
    ws.ts                  attachWebSocket — subscribes to the bus, fans out
  routes/
    index.ts               mounts every resource under /api + endpoint catalog
    <resource>/
      <resource>.routes.ts       Router — HTTP method + path wiring
      <resource>.controller.ts   request → service → response
      <resource>.service.ts      Prisma access + domain logic; emits events
      <resource>.schema.ts       parse/validate untrusted input (incidents only)
prisma/
  schema.prisma            data model
  seed.ts                  fixture data (mirrors apps/client/app/data/incidents.ts)
```

### Request flow

`routes` (method + path) → `controller` (parse input, call service, shape the
response) → `service` (all Prisma calls; on a write it `publish()`es a domain
event) → `lib/events` bus → `realtime/ws` relays it to every client.

Errors are thrown, not returned: an `ApiError(status, message)` from `lib/http`
becomes `{ error }` with that status in `app.ts`; anything else is a 500.

### Adding a resource

1. Create `src/routes/<name>/` with `<name>.routes.ts`, `<name>.controller.ts`,
   `<name>.service.ts` (and `<name>.schema.ts` if it accepts a request body).
2. Register its Router in `src/routes/index.ts` and add its rows to
   `endpointCatalog`.

## Resources

| Mount            | Purpose                                            |
| ---------------- | ------------------------------------------------- |
| `/api/health`    | liveness + database check                          |
| `/api/incidents` | incidents CRUD and their activity trail            |
| `/api/activity`  | global activity feed across all incidents          |
| `/api/user`      | current operator (stub) + operator roster          |

`GET /` returns the live endpoint catalog; each `*.routes.ts` lists its routes.

## Realtime

A write publishes an event that `/ws` relays to every connected client as JSON
(`{ "type": …, "data": … }`):

| Event              | When                          |
| ------------------ | ----------------------------- |
| `incident:created` | an incident is created        |
| `incident:updated` | an incident is patched        |
| `incident:deleted` | an incident is deleted        |
| `activity:created` | an activity entry is appended |

## Data model

`Incident` and `ActivityEvent` in `prisma/schema.prisma`, shaped to match the UI
contract in `apps/client/app/data/incidents.ts`. Dev uses `prisma db push` — no
migration history yet.
