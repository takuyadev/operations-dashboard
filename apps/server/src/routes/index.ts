/**
 * The REST surface. The app mounts this under `/api`.
 *
 * One folder per resource under `routes/`, each exposing a `<name>.routes.ts`
 * Router (thin wiring + JSDoc examples) that delegates to a `<name>.controller.ts`
 * and a `<name>.service.ts`. Add a resource by dropping in that folder and
 * registering its Router below.
 */
import { Router } from "express";
import { activityRoutes } from "./activity/activity.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { incidentsRoutes } from "./incidents/incidents.routes.js";
import { userRoutes } from "./user/user.routes.js";

export const api = Router();

api.use("/health", healthRoutes);
api.use("/incidents", incidentsRoutes);
api.use("/activity", activityRoutes);
api.use("/user", userRoutes);

/** Human-readable map of the API, served at `GET /`. */
export const endpointCatalog = {
  "GET /api/health": "liveness + database check",
  "GET /api/incidents":
    "list incidents (?status= ?priority= ?assignee= ?assignedToMe=true)",
  "POST /api/incidents": "create an incident (emits incident:created)",
  "GET /api/incidents/:id": "one incident with its activity",
  "PATCH /api/incidents/:id": "update an incident (emits incident:updated)",
  "DELETE /api/incidents/:id": "delete an incident (emits incident:deleted)",
  "GET /api/incidents/:id/activity": "activity trail for one incident",
  "POST /api/incidents/:id/activity":
    "append an activity entry (emits activity:created)",
  "GET /api/activity": "global activity feed (?take=)",
  "GET /api/user": "the current operator",
  "GET /api/user/list": "operators with incidents assigned",
} as const;
