/**
 * Server-only bridge to the operations-dashboard API (apps/server).
 *
 * The `.server` suffix keeps this module out of the browser bundle — only
 * loaders and actions (which run during SSR / on form posts) import it.
 */
import type {
  ActivityEvent,
  Incident,
  IncidentStatus,
} from "../data/incidents";

/** An incident plus its activity trail, as returned by `GET /api/incidents/:id`. */
export type IncidentDetail = Incident & { activity: ActivityEvent[] };

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** WebSocket endpoint the browser connects to for the live incident feed. */
export const PUBLIC_WS_URL =
  process.env.PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

export async function listIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_URL}/api/incidents`);
  if (!res.ok) {
    throw new Response(`Incident API responded ${res.status}`, { status: 502 });
  }
  return (await res.json()) as Incident[];
}

/** Fetch one incident with its activity. Returns null for an unknown / invalid id. */
export async function getIncident(id: string): Promise<IncidentDetail | null> {
  const res = await fetch(`${API_URL}/api/incidents/${encodeURIComponent(id)}`);
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) {
    throw new Response(`Incident API responded ${res.status}`, { status: 502 });
  }
  return (await res.json()) as IncidentDetail;
}

/** Change fields on one incident. `PATCH /api/incidents/:id` (emits `incident:updated`). */
export async function updateIncident(
  id: string,
  patch: {
    status?: IncidentStatus;
    assignee?: string | null;
    assignedToMe?: boolean;
  },
): Promise<Incident> {
  const res = await fetch(`${API_URL}/api/incidents/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new Response(`Incident API responded ${res.status}`, { status: 502 });
  }
  return (await res.json()) as Incident;
}

/** Append an activity entry to one incident. `POST /api/incidents/:id/activity`. */
export async function addIncidentActivity(
  id: string,
  event: { kind: ActivityEvent["kind"]; message: string; time?: string },
): Promise<ActivityEvent> {
  const res = await fetch(
    `${API_URL}/api/incidents/${encodeURIComponent(id)}/activity`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    },
  );
  if (!res.ok) {
    throw new Response(`Incident API responded ${res.status}`, { status: 502 });
  }
  return (await res.json()) as ActivityEvent;
}

/* Rotating fixture drafts for the simulate page, so a demo run doesn't look
   scripted. Priority and assignment are randomised per press. */
const DRAFTS = [
  {
    summary: "Debris in live lane",
    location: "Route 246 · Sangenjaya overpass",
    detail:
      "Sensor array reports a stationary object in the center lane. CCTV confirms fallen cargo; danger to motorcycles.",
  },
  {
    summary: "Stalled vehicle on shoulder",
    location: "Chuo Expwy · Takaido on-ramp",
    detail:
      "Passenger vehicle stopped on the left shoulder with hazard lights on. No injuries reported.",
  },
  {
    summary: "Wrong-way vehicle reported",
    location: "Metropolitan Expwy · near Shibuya",
    detail:
      "Roadside sensor 4-C flags a vehicle travelling against inbound traffic. Awaiting CCTV confirmation.",
  },
  {
    summary: "Animal on the carriageway",
    location: "Chuo Expwy · Chofu",
    detail:
      "CCTV shows a deer on the carriageway. Traffic slowing in the right lane.",
  },
  {
    summary: "Signal fault at junction",
    location: "Loop 7 · Ohashi junction",
    detail: "Lane-use signal intermittently dark. Maintenance not yet notified.",
  },
] as const;

const PRIORITIES = ["high", "medium", "low"] as const;

function randomDraft() {
  const base = DRAFTS[Math.floor(Math.random() * DRAFTS.length)];
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  return { ...base, priority, assignedToMe: Math.random() < 0.5 };
}

export async function createSimulatedIncident(): Promise<Incident> {
  const res = await fetch(`${API_URL}/api/incidents`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(randomDraft()),
  });
  if (!res.ok) {
    throw new Response(`Incident API responded ${res.status}`, { status: 502 });
  }
  return (await res.json()) as Incident;
}
