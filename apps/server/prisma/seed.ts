import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* Mirrors apps/client/app/data/incidents.ts so the API serves the same fixture
   the UI was built against. */

const INCIDENTS = [
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
] as const;

const ACTIVITY = [
  // Global dashboard feed.
  { kind: "alert-high", message: "New high-priority incident #12345 — wrong-way vehicle near Shibuya", time: "2 min ago", incidentId: 12345 },
  { kind: "assign", message: "Kenji assigned incident #12345 to you", time: "2 min ago", incidentId: 12345 },
  { kind: "dispatch", message: "Patrol unit 7 dispatched to incident #12343", time: "14 min ago", incidentId: 12343 },
  { kind: "alert-low", message: "New low-priority incident #12341 — sensor offline near Daiba", time: "38 min ago", incidentId: 12341 },
  { kind: "resolve", message: "Tomo resolved incident #12340", time: "51 min ago", incidentId: 12340 },
  { kind: "resolve", message: "Kenji resolved incident #12339", time: "1 hr 24 min ago", incidentId: 12339 },
  // Incident-detail feed for #12345.
  { kind: "alert-high", message: "Incident #12345 raised by sensor 4-C, confirmed on CCTV S-118", time: "3 min ago", incidentId: 12345 },
] as const;

async function main() {
  console.log("[seed] clearing existing rows…");
  await prisma.activityEvent.deleteMany();
  await prisma.incident.deleteMany();

  console.log(`[seed] inserting ${INCIDENTS.length} incidents…`);
  for (const incident of INCIDENTS) {
    await prisma.incident.create({
      data: { ...incident, reportedAt: new Date(incident.reportedAt) },
    });
  }

  // Keep the autoincrement sequence ahead of the hand-picked ids above so that
  // POST /api/incidents does not collide.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Incident"', 'id'), (SELECT MAX(id) FROM "Incident"))`,
  );

  console.log(`[seed] inserting ${ACTIVITY.length} activity events…`);
  for (const event of ACTIVITY) {
    await prisma.activityEvent.create({ data: { ...event } });
  }

  console.log("[seed] done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
