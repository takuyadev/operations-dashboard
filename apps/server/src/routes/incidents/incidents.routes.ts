import { Router } from "express";
import * as incidents from "./incidents.controller.js";

/**
 * `/api/incidents` — road incidents and their activity trail.
 * Every mutation broadcasts a matching event on the `/ws` WebSocket feed.
 */
export const incidentsRoutes = Router();

// Incident
incidentsRoutes.get("/", incidents.getIncidents);
incidentsRoutes.get("/:id", incidents.getIncidentById);
incidentsRoutes.post("/", incidents.postIncident);
incidentsRoutes.patch("/:id", incidents.patchIncident);
incidentsRoutes.delete("/:id", incidents.deleteIncident);

// Incident Activity
incidentsRoutes.get("/:id/activity", incidents.getIncidentActivity);
incidentsRoutes.post("/:id/activity", incidents.postIncidentActivity);
