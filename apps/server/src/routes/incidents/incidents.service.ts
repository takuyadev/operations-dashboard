/**
 * Data access + domain logic for incidents. Owns all Prisma calls for this
 * resource and emits the matching realtime events on writes.
 *
 * Method names follow a CRUD convention: `getAll` / `getById` / `create` /
 * `update` / `deleteById`, plus `getActivity` / `createActivity` for the
 * nested activity trail.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { publish } from "../../lib/events.js";
import { ApiError } from "../../lib/http.js";
import type {
  CreateActivityInput,
  CreateIncidentInput,
  IncidentFilter,
  UpdateIncidentInput,
} from "./incidents.schema.js";

const notFound = () => new ApiError(404, "Incident not found");

const isMissingRecord = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";

export const incidentsService = {
  /** List incidents matching the filter, newest first. */
  getAll(filter: IncidentFilter) {
    return prisma.incident.findMany({
      where: {
        status: filter.status,
        priority: filter.priority,
        assignee: filter.assignee,
        assignedToMe: filter.assignedToMe,
      },
      orderBy: { reportedAt: "desc" },
    });
  },

  /** One incident with its activity trail (newest first). Throws 404 if unknown. */
  async getById(id: number) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { activity: { orderBy: { createdAt: "desc" } } },
    });
    if (!incident) {
      throw notFound();
    }
    return incident;
  },

  /** Create an incident + its opening alert entry. Emits `incident:created`. */
  async create(input: CreateIncidentInput) {
    const incident = await prisma.incident.create({
      data: {
        summary: input.summary,
        location: input.location,
        detail: input.detail,
        priority: input.priority,
        status: input.status,
        assignee: input.assignee,
        assignedToMe: input.assignedToMe,
        reportedAt: input.reportedAt,
      },
    });

    const activity = await prisma.activityEvent.create({
      data: {
        incidentId: incident.id,
        kind: input.priority === "high" ? "alert-high" : "alert-low",
        message: `New ${input.priority}-priority incident #${incident.id} — ${incident.summary}`,
        time: "just now",
      },
    });

    const full = { ...incident, activity: [activity] };
    publish({ type: "incident:created", data: full });
    return full;
  },

  /** Patch an incident. Emits `incident:updated`. Throws 404 if unknown. */
  async update(id: number, patch: UpdateIncidentInput) {
    try {
      const incident = await prisma.incident.update({ where: { id }, data: patch });
      publish({ type: "incident:updated", data: incident });
      return incident;
    } catch (err) {
      if (isMissingRecord(err)) {
        throw notFound();
      }
      throw err;
    }
  },

  /** Delete an incident (cascades to its activity). Emits `incident:deleted`. */
  async deleteById(id: number) {
    try {
      await prisma.incident.delete({ where: { id } });
      publish({ type: "incident:deleted", data: { id } });
    } catch (err) {
      if (isMissingRecord(err)) {
        throw notFound();
      }
      throw err;
    }
  },

  /** The activity trail for one incident, newest first. */
  getActivity(incidentId: number) {
    return prisma.activityEvent.findMany({
      where: { incidentId },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Append an activity entry. Emits `activity:created`. Throws 404 if the incident is unknown. */
  async createActivity(incidentId: number, input: CreateActivityInput) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      throw notFound();
    }

    const activity = await prisma.activityEvent.create({
      data: {
        incidentId,
        kind: input.kind,
        message: input.message,
        time: input.time,
      },
    });
    publish({ type: "activity:created", data: activity });
    return activity;
  },
};
