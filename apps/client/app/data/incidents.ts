/* =============================================================================
   Mock incident data + domain types.
   Stands in for the API until the server app exists. Shapes here are the
   contract the UI is built against.
   ========================================================================== */

export type Priority = "high" | "medium" | "low";
export type IncidentStatus = "unresolved" | "dispatched" | "resolved";

export interface Incident {
  /** Numeric id; formatted for display with formatIncidentId(). */
  id: number;
  status: IncidentStatus;
  priority: Priority;
  /** Short scannable description — what and where. */
  summary: string;
  /** Road / corridor the incident sits on. */
  location: string;
  /** Longer account shown on the detail page. */
  detail: string;
  /** Operator the incident is assigned to, or null if unassigned. */
  assignee: string | null;
  /** ISO timestamp the incident was reported. */
  reportedAt: string;
  assignedToMe: boolean;
}

export type ActivityKind =
  | "alert-high"
  | "alert-low"
  | "assign"
  | "dispatch"
  | "resolve";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  message: string;
  /** Short relative time, e.g. "4 min ago". */
  time: string;
}

/* ---- Incidents ------------------------------------------------------------ */

export const INCIDENTS: Incident[] = [
  {
    id: 12345,
    status: "unresolved",
    priority: "high",
    summary: "Wrong-way vehicle, inbound",
    location: "Metropolitan Expwy · near Shibuya",
    detail:
      "A vehicle is traveling against traffic on the inbound Metropolitan Expressway near Shibuya. First flagged by roadside sensor 4-C and confirmed on CCTV camera S-118. No collision reported yet; traffic in the two right lanes is slowing.",
    assignee: "Kenji",
    reportedAt: "2026-08-30T02:11:00+09:00",
    assignedToMe: true,
  },
  {
    id: 12344,
    status: "unresolved",
    priority: "high",
    summary: "Small debris in live lane",
    location: "Route 246 · Sangenjaya overpass",
    detail:
      "Sensor array reports a stationary object roughly 0.6 m across in the center lane. CCTV confirms fallen cargo. Potential danger to motorcycles.",
    assignee: null,
    reportedAt: "2026-08-30T01:52:00+09:00",
    assignedToMe: false,
  },
  {
    id: 12343,
    status: "dispatched",
    priority: "medium",
    summary: "Stalled vehicle on shoulder",
    location: "Chuo Expwy · Takaido on-ramp",
    detail:
      "Passenger vehicle stopped on the left shoulder with hazard lights on. Patrol unit 7 dispatched and en route.",
    assignee: "Tomo",
    reportedAt: "2026-08-30T01:20:00+09:00",
    assignedToMe: false,
  },
  {
    id: 12342,
    status: "unresolved",
    priority: "medium",
    summary: "Signal fault at junction",
    location: "Loop 7 · Ohashi junction",
    detail:
      "Lane-use signal at the Ohashi junction is intermittently dark. Maintenance notified.",
    assignee: "Kenji",
    reportedAt: "2026-08-30T00:58:00+09:00",
    assignedToMe: true,
  },
  {
    id: 12341,
    status: "unresolved",
    priority: "low",
    summary: "Roadside sensor offline",
    location: "Wangan Route · Daiba",
    detail:
      "Sensor node 2-A near Daiba stopped reporting at 00:30. Adjacent nodes cover the segment. Low urgency.",
    assignee: null,
    reportedAt: "2026-08-30T00:31:00+09:00",
    assignedToMe: false,
  },
  {
    id: 12340,
    status: "resolved",
    priority: "low",
    summary: "Litter on shoulder cleared",
    location: "Route 1 · Gotanda",
    detail: "Scattered litter on the left shoulder. Cleared by patrol unit 3.",
    assignee: "Tomo",
    reportedAt: "2026-08-29T23:40:00+09:00",
    assignedToMe: false,
  },
  {
    id: 12339,
    status: "resolved",
    priority: "high",
    summary: "Multi-vehicle collision cleared",
    location: "Metropolitan Expwy · Tanimachi",
    detail:
      "Two-vehicle collision blocking the right lane. Safety team dispatched, lane reopened at 23:15.",
    assignee: "Kenji",
    reportedAt: "2026-08-29T22:47:00+09:00",
    assignedToMe: false,
  },
  {
    id: 12338,
    status: "resolved",
    priority: "medium",
    summary: "Animal on carriageway removed",
    location: "Chuo Expwy · Chofu",
    detail: "Deer on the carriageway near Chofu. Removed by patrol unit 5.",
    assignee: "Tomo",
    reportedAt: "2026-08-29T21:10:00+09:00",
    assignedToMe: false,
  },
];

/* ---- Activity feeds ----------------------------------------------------- */

export const DASHBOARD_ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    kind: "alert-high",
    message: "New high-priority incident #12345 — wrong-way vehicle near Shibuya",
    time: "2 min ago",
  },
  {
    id: "a2",
    kind: "assign",
    message: "Kenji assigned incident #12345 to you",
    time: "2 min ago",
  },
  {
    id: "a3",
    kind: "dispatch",
    message: "Patrol unit 7 dispatched to incident #12343",
    time: "14 min ago",
  },
  {
    id: "a4",
    kind: "alert-low",
    message: "New low-priority incident #12341 — sensor offline near Daiba",
    time: "38 min ago",
  },
  {
    id: "a5",
    kind: "resolve",
    message: "Tomo resolved incident #12340",
    time: "51 min ago",
  },
  {
    id: "a6",
    kind: "resolve",
    message: "Kenji resolved incident #12339",
    time: "1 hr 24 min ago",
  },
];

export const INCIDENT_ACTIVITY: Record<number, ActivityEvent[]> = {
  12345: [
    {
      id: "d1",
      kind: "assign",
      message: "Kenji assigned incident #12345 to you",
      time: "2 min ago",
    },
    {
      id: "d2",
      kind: "alert-high",
      message: "Incident #12345 raised by sensor 4-C, confirmed on CCTV S-118",
      time: "3 min ago",
    },
  ],
};

/* ---- Helpers ---------------------------------------------------------------- */

export function formatIncidentId(id: number): string {
  return `#${id}`;
}

export function getIncident(id: string | number | undefined): Incident | undefined {
  const numeric = typeof id === "string" ? Number.parseInt(id, 10) : id;
  if (numeric === undefined || Number.isNaN(numeric)) return undefined;
  return INCIDENTS.find((incident) => incident.id === numeric);
}

export function getIncidentActivity(id: number): ActivityEvent[] {
  return INCIDENT_ACTIVITY[id] ?? [];
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  unresolved: "Unresolved",
  dispatched: "Dispatched",
  resolved: "Resolved",
};

/** Count of unresolved incidents broken down by priority. */
export function unresolvedByPriority(): Record<Priority, number> {
  const counts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  for (const incident of INCIDENTS) {
    if (incident.status !== "resolved") counts[incident.priority] += 1;
  }
  return counts;
}
