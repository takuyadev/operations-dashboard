import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { publish } from "../events.js";

export const incidentsRouter = Router();

const PRIORITIES = ["high", "medium", "low"] as const;
const STATUSES = ["unresolved", "dispatched", "resolved"] as const;

type Priority = (typeof PRIORITIES)[number];
type IncidentStatus = (typeof STATUSES)[number];

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const isMissingRecord = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";

/* ---- GET /api/incidents --------------------------------------------------- */
// Optional filters: ?status= &priority= &assignedToMe=true
incidentsRouter.get("/", async (req, res) => {
  const { status, priority, assignedToMe } = req.query;
  const where: Prisma.IncidentWhereInput = {};

  if (typeof status === "string") {
    if (!STATUSES.includes(status as IncidentStatus))
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
    where.status = status as IncidentStatus;
  }
  if (typeof priority === "string") {
    if (!PRIORITIES.includes(priority as Priority))
      return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
    where.priority = priority as Priority;
  }
  if (assignedToMe === "true") where.assignedToMe = true;

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { reportedAt: "desc" },
  });
  res.json(incidents);
});

/* ---- GET /api/incidents/:id -------------------------------------------- */
incidentsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "id must be a positive integer" });

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { activity: { orderBy: { createdAt: "desc" } } },
  });
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json(incident);
});

/* ---- POST /api/incidents -------------------------------------------------- */
// Creating an incident emits an `incident:created` WebSocket event.
incidentsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const missing = ["summary", "location", "detail"].filter(
    (key) => typeof body[key] !== "string" || (body[key] as string).trim() === "",
  );
  if (missing.length)
    return res.status(400).json({ error: `Missing or invalid fields: ${missing.join(", ")}` });

  if (body.priority !== undefined && !PRIORITIES.includes(body.priority as Priority))
    return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
  if (body.status !== undefined && !STATUSES.includes(body.status as IncidentStatus))
    return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });

  const priority = (body.priority as Priority) ?? "medium";

  const incident = await prisma.incident.create({
    data: {
      summary: (body.summary as string).trim(),
      location: (body.location as string).trim(),
      detail: (body.detail as string).trim(),
      priority,
      status: (body.status as IncidentStatus) ?? "unresolved",
      assignee: typeof body.assignee === "string" ? body.assignee : null,
      assignedToMe: body.assignedToMe === true,
      reportedAt:
        typeof body.reportedAt === "string" && !Number.isNaN(Date.parse(body.reportedAt))
          ? new Date(body.reportedAt)
          : undefined,
    },
  });

  const activity = await prisma.activityEvent.create({
    data: {
      incidentId: incident.id,
      kind: priority === "high" ? "alert-high" : "alert-low",
      message: `New ${priority}-priority incident #${incident.id} — ${incident.summary}`,
      time: "just now",
    },
  });

  const full = { ...incident, activity: [activity] };
  publish({ type: "incident:created", data: full });
  res.status(201).json(full);
});

/* ---- PATCH /api/incidents/:id ---------------------------------------- */
incidentsRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "id must be a positive integer" });

  const body = (req.body ?? {}) as Record<string, unknown>;
  const data: Prisma.IncidentUpdateInput = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as IncidentStatus))
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
    data.status = body.status as IncidentStatus;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority as Priority))
      return res.status(400).json({ error: `priority must be one of ${PRIORITIES.join(", ")}` });
    data.priority = body.priority as Priority;
  }
  for (const key of ["summary", "location", "detail"] as const) {
    if (typeof body[key] === "string") data[key] = (body[key] as string).trim();
  }
  if (body.assignee !== undefined)
    data.assignee = typeof body.assignee === "string" ? body.assignee : null;
  if (body.assignedToMe !== undefined) data.assignedToMe = body.assignedToMe === true;

  if (Object.keys(data).length === 0)
    return res.status(400).json({ error: "No updatable fields provided" });

  try {
    const incident = await prisma.incident.update({ where: { id }, data });
    publish({ type: "incident:updated", data: incident });
    res.json(incident);
  } catch (err) {
    if (isMissingRecord(err)) return res.status(404).json({ error: "Incident not found" });
    throw err;
  }
});

/* ---- DELETE /api/incidents/:id ------------------------------------------- */
incidentsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "id must be a positive integer" });

  try {
    await prisma.incident.delete({ where: { id } });
    publish({ type: "incident:deleted", data: { id } });
    res.status(204).end();
  } catch (err) {
    if (isMissingRecord(err)) return res.status(404).json({ error: "Incident not found" });
    throw err;
  }
});

/* ---- Activity sub-resource -------------------------------------------- */
incidentsRouter.get("/:id/activity", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "id must be a positive integer" });

  const activity = await prisma.activityEvent.findMany({
    where: { incidentId: id },
    orderBy: { createdAt: "desc" },
  });
  res.json(activity);
});

incidentsRouter.post("/:id/activity", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "id must be a positive integer" });

  const body = (req.body ?? {}) as Record<string, unknown>;
  if (typeof body.kind !== "string" || typeof body.message !== "string")
    return res.status(400).json({ error: "kind and message are required strings" });

  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const activity = await prisma.activityEvent.create({
    data: {
      incidentId: id,
      kind: body.kind,
      message: body.message,
      time: typeof body.time === "string" ? body.time : "just now",
    },
  });
  publish({ type: "activity:created", data: activity });
  res.status(201).json(activity);
});
