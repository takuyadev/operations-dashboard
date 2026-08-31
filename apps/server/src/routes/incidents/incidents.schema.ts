/**
 * The HTTP trust boundary for the incidents resource.
 *
 * Express hands handlers `req.body` / `req.query` as `Record<string, unknown>` —
 * untrusted, untyped, and (for query strings) all-strings. Each parser below
 * turns that into a typed, trimmed, validated object, throwing `ApiError(400)`
 * with a field-specific message on bad input. Controllers and the service can
 * then treat their arguments as already-valid.
 */
import { ApiError } from "../../lib/http.js";

export const PRIORITIES = ["high", "medium", "low"] as const;
export const STATUSES = ["unresolved", "dispatched", "resolved"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type IncidentStatus = (typeof STATUSES)[number];

/**
 * Assert `value` is one of `allowed` and return it narrowed to that literal
 * union. Used for the enum-backed `status` and `priority` fields — throws 400
 * listing the valid values instead of letting a bad string reach Prisma.
 */
function oneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new ApiError(400, `${field} must be one of ${allowed.join(", ")}`);
  }
  return value;
}

/* ---- GET /api/incidents ------------------------------------------------- */

export interface IncidentFilter {
  status?: IncidentStatus;
  priority?: Priority;
  assignee?: string;
  assignedToMe?: boolean;
}

/**
 * Validate the `GET /api/incidents` query string (which arrives as all strings):
 *
 * - `status`, `priority` — if present, must be a valid enum value (else 400).
 * - `assignee` — trimmed; ignored when blank.
 * - `assignedToMe` — the literal string `"true"` becomes boolean `true`;
 *   anything else is ignored.
 *
 * Absent keys stay `undefined`, so the service leaves them out of the `where`.
 *
 * @example
 * parseIncidentFilter({ status: "unresolved", assignee: "Kenji" });
 * // → { status: "unresolved", assignee: "Kenji" }
 */
export function parseIncidentFilter(
  query: Record<string, unknown>,
): IncidentFilter {
  const filter: IncidentFilter = {};
  if (query.status !== undefined) {
    filter.status = oneOf(query.status, STATUSES, "status");
  }
  if (query.priority !== undefined) {
    filter.priority = oneOf(query.priority, PRIORITIES, "priority");
  }
  if (typeof query.assignee === "string" && query.assignee.trim() !== "") {
    filter.assignee = query.assignee.trim();
  }
  if (query.assignedToMe === "true") {
    filter.assignedToMe = true;
  }
  return filter;
}

/* ---- POST /api/incidents ---------------------------------------------- */

export interface CreateIncidentInput {
  summary: string;
  location: string;
  detail: string;
  priority: Priority;
  status: IncidentStatus;
  assignee: string | null;
  assignedToMe: boolean;
  reportedAt?: Date;
}

/**
 * Validate a `POST /api/incidents` body:
 *
 * - `summary`, `location`, `detail` — required, non-empty after trimming
 *   (Prisma would accept `""`; the API shouldn't).
 * - `priority` — valid enum, or defaults to `"medium"`.
 * - `status` — valid enum, or defaults to `"unresolved"`.
 * - `assignee` — a string, or `null` (any non-string is treated as unassigned).
 * - `assignedToMe` — boolean, defaulting to `false`.
 * - `reportedAt` — kept only if it parses to a real date; otherwise dropped so
 *   the column default (`now()`) applies.
 *
 * @example
 * parseCreateIncident({ summary: "Debris", location: "Route 246", detail: "Pallet", priority: "high" });
 */
export function parseCreateIncident(
  body: Record<string, unknown>,
): CreateIncidentInput {
  const text = (key: string): string => {
    const value = body[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new ApiError(400, `${key} is required`);
    }
    return value.trim();
  };

  return {
    summary: text("summary"),
    location: text("location"),
    detail: text("detail"),
    priority:
      body.priority === undefined
        ? "medium"
        : oneOf(body.priority, PRIORITIES, "priority"),
    status:
      body.status === undefined
        ? "unresolved"
        : oneOf(body.status, STATUSES, "status"),
    assignee: typeof body.assignee === "string" ? body.assignee : null,
    assignedToMe: body.assignedToMe === true,
    reportedAt:
      typeof body.reportedAt === "string" &&
      !Number.isNaN(Date.parse(body.reportedAt))
        ? new Date(body.reportedAt)
        : undefined,
  };
}

/* ---- PATCH /api/incidents/:id --------------------------------------- */

export interface UpdateIncidentInput {
  status?: IncidentStatus;
  priority?: Priority;
  summary?: string;
  location?: string;
  detail?: string;
  assignee?: string | null;
  assignedToMe?: boolean;
}

/**
 * Validate a `PATCH /api/incidents/:id` body. Every field is optional, but at
 * least one recognised field must be present — an otherwise-empty PATCH is
 * rejected with 400 rather than becoming a silent no-op.
 *
 * - `status`, `priority` — valid enum when present.
 * - `summary`, `location`, `detail` — trimmed when present (a blank value is
 *   allowed here: clearing a field is the caller's call).
 * - `assignee` — a string, or `null` to unassign.
 * - `assignedToMe` — boolean.
 *
 * @example
 * parseUpdateIncident({ status: "dispatched", assignee: "Kenji" });
 */
export function parseUpdateIncident(
  body: Record<string, unknown>,
): UpdateIncidentInput {
  const patch: UpdateIncidentInput = {};
  if (body.status !== undefined) {
    patch.status = oneOf(body.status, STATUSES, "status");
  }
  if (body.priority !== undefined) {
    patch.priority = oneOf(body.priority, PRIORITIES, "priority");
  }
  for (const key of ["summary", "location", "detail"] as const) {
    if (typeof body[key] === "string") {
      patch[key] = (body[key] as string).trim();
    }
  }
  if (body.assignee !== undefined) {
    patch.assignee = typeof body.assignee === "string" ? body.assignee : null;
  }
  if (body.assignedToMe !== undefined) {
    patch.assignedToMe = body.assignedToMe === true;
  }

  if (Object.keys(patch).length === 0) {
    throw new ApiError(400, "No updatable fields provided");
  }
  return patch;
}

/* ---- POST /api/incidents/:id/activity ------------------------------- */

export interface CreateActivityInput {
  kind: string;
  message: string;
  time: string;
}

/**
 * Validate a `POST /api/incidents/:id/activity` body:
 *
 * - `kind` — required, non-empty. Not enum-checked on purpose: `kind` is a
 *   free-form `String` column (`alert-high`, `dispatch`, `message`, …), so new
 *   kinds don't need a schema change.
 * - `message` — required, non-empty.
 * - `time` — optional human display string ("4 min ago"); defaults to
 *   `"just now"`.
 *
 * @example
 * parseCreateActivity({ kind: "dispatch", message: "Patrol unit 7 en route" });
 * // → { kind: "dispatch", message: "Patrol unit 7 en route", time: "just now" }
 */
export function parseCreateActivity(
  body: Record<string, unknown>,
): CreateActivityInput {
  if (typeof body.kind !== "string" || body.kind.trim() === "") {
    throw new ApiError(400, "kind is required");
  }
  if (typeof body.message !== "string" || body.message.trim() === "") {
    throw new ApiError(400, "message is required");
  }
  return {
    kind: body.kind,
    message: body.message,
    time: typeof body.time === "string" ? body.time : "just now",
  };
}
