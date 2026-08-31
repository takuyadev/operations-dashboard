# client

Operator-facing dashboard: **React Router 8** (framework mode, SSR) on
**React 19** + **Vite 8**. Renders the unresolved-incident queue, a live
activity feed, the searchable history, and the per-incident review & response
screen.

The UI runs on a **design-system token layer** — vanilla CSS custom properties,
CSS Modules, no Tailwind. Visual choices trace back to the user analysis in the
root [`CLAUDE.md`](../../CLAUDE.md): operators are ~56, so high contrast, large
type and hit targets, and a clear split between monitoring and alert mode.

Run everything with `pnpm dev` from the repo root (client on
<http://localhost:5173>, API on 4000).

## Routes

Configured in [`app/routes.ts`](app/routes.ts).

| Path             | Screen          | What                                                          |
| ---------------- | --------------- | ------------------------------------------------------------ |
| `/`              | Dashboard       | Unresolved queue (infinite scroll) + live activity feed      |
| `/incidents`     | History         | Every logged incident, searchable by ID and filterable       |
| `/incidents/:id` | Incident detail | Review, then respond: assign/unassign · message · dispatch · resolve/reopen |
| `/simulate`      | Simulate        | Emit test incidents into the API                             |

## Structure

```
app/
  routes/       one file per screen — loader/action/meta + JSX, co-located *.module.css
  hooks/        screen state & logic, kept out of the route files
  components/   shared presentational UI primitives, each with its *.module.css
  lib/          api.server.ts (server-only fetch bridge), theme.ts, user.ts
  data/         incidents.ts — domain types, label maps, formatIncidentId
  utilities/    cx.ts — classname join
  styles/       token layer + global base styles
  root.tsx      document shell, theme cookie, font links
```

- **Screens live in `app/routes/`.** A route file holds its `loader` /
  `action` / `meta` and JSX; stateful logic moves into a hook in `app/hooks/`
  (`useDashboardData`, `useIncidentHistory`, `useIncidentResponse`,
  `useIncidentStream`).
- **`app/components/`** is shared primitives only — `AppShell`, `Panel`,
  `Button`, `IncidentTable`, `ActivityFeed`, `PageHeader`, `Pagination`,
  `FilterPanel`, `SearchField`, `Field`, `Tag/*`, `Icon`, `Avatar`,
  `MediaFrame`, `LiveBadge`, `AlertBanner`, `StatBlock`, `ThemeToggle`.
- **Aliases** (`tsconfig.json`): `@components/*`, `@utilities/*`.

## Styling

`app/app.css` imports the design-system tokens (`app/styles/tokens/*.css` —
colors, typography, spacing, radius, shadows, motion), then
`app/styles/app-tokens.css` (layout geometry and compound helpers like
`--border`, `--rail-w`, all in tokens), then `app/styles/base.css` (global
element styles on normalize.css).

- Styling is **CSS Modules**, co-located (`Panel.tsx` ↔ `Panel.module.css`);
  module files reference **tokens only** — no raw colors, sizes, or timings.
- **Dark-first.** `:root[data-theme="light"]` is the sole override; the theme
  comes from a cookie read in `root.tsx` (`lib/theme.ts`), flipped by
  `ThemeToggle` / `useTheme`.
- Fonts: **Noto Sans JP** (UI, incl. CJK) and **JetBrains Mono** (mono), via
  Google Fonts in `root.tsx`.

## Data flow

1. A route **`loader`** fetches from the API through `lib/api.server.ts` (the
   `.server` suffix keeps it out of the browser bundle) — first paint has data.
2. The browser opens the WebSocket via **`useIncidentStream`**, folding
   `incident:*` and `activity:created` events into the list and reconnecting if
   the socket drops.
3. Detail-screen mutations post to the route **`action`**, which calls the API
   and revalidates — the server stays the source of truth.

**No authentication** — the current operator is a constant in `lib/user.ts`.
