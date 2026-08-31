/**
 * Request/response glue for the incidents resource. Each handler parses input
 * with the schema helpers, calls the service, and shapes the HTTP response.
 * Thrown errors bubble to the app's error middleware.
 *
 * Handlers are named `<httpMethod><Resource>` so they read the same as the
 * route wiring: `incidentsRoutes.post("/", incidents.postIncident)`.
 */
import type { Request, Response } from "express";
import { parseId } from "../../lib/http.js";
import { incidentsService } from "./incidents.service.js";
import {
  parseCreateActivity,
  parseCreateIncident,
  parseIncidentFilter,
  parseUpdateIncident,
} from "./incidents.schema.js";

const body = (req: Request): Record<string, unknown> =>
  (req.body ?? {}) as Record<string, unknown>;

/** `GET /api/incidents` */
export async function getIncidents(req: Request, res: Response) {
  const filter = parseIncidentFilter(req.query as Record<string, unknown>);
  res.json(await incidentsService.getAll(filter));
}

/** `GET /api/incidents/:id` */
export async function getIncidentById(req: Request, res: Response) {
  res.json(await incidentsService.getById(parseId(req.params.id)));
}

/** `POST /api/incidents` */
export async function postIncident(req: Request, res: Response) {
  const incident = await incidentsService.create(parseCreateIncident(body(req)));
  res.status(201).json(incident);
}

/** `PATCH /api/incidents/:id` */
export async function patchIncident(req: Request, res: Response) {
  const incident = await incidentsService.update(
    parseId(req.params.id),
    parseUpdateIncident(body(req)),
  );
  res.json(incident);
}

/** `DELETE /api/incidents/:id` */
export async function deleteIncident(req: Request, res: Response) {
  await incidentsService.deleteById(parseId(req.params.id));
  res.status(204).end();
}

/** `GET /api/incidents/:id/activity` */
export async function getIncidentActivity(req: Request, res: Response) {
  res.json(await incidentsService.getActivity(parseId(req.params.id)));
}

/** `POST /api/incidents/:id/activity` */
export async function postIncidentActivity(req: Request, res: Response) {
  const activity = await incidentsService.createActivity(
    parseId(req.params.id),
    parseCreateActivity(body(req)),
  );
  res.status(201).json(activity);
}
