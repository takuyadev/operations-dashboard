import "dotenv/config";
import http from "node:http";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { prisma } from "./prisma.js";
import { incidentsRouter } from "./routes/incidents.js";
import { activityRouter } from "./routes/activity.js";
import { attachWebSocket } from "./ws.js";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "operations-dashboard-server",
    status: "ok",
    websocket: "/ws",
    endpoints: {
      "GET /api/health": "liveness + database check",
      "GET /api/incidents": "list incidents (?status= ?priority= ?assignedToMe=true ?assignee=)",
      "POST /api/incidents": "create incident (emits incident:created over /ws)",
      "GET /api/incidents/:id": "one incident with its activity",
      "PATCH /api/incidents/:id": "update incident",
      "DELETE /api/incidents/:id": "delete incident",
      "GET /api/incidents/:id/activity": "activity for one incident",
      "POST /api/incidents/:id/activity": "append an activity event",
      "GET /api/activity": "global activity feed (?take=)",
    },
  });
});

app.get("/api/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/incidents", incidentsRouter);
app.use("/api/activity", activityRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Internal server error" });
});

const server = http.createServer(app);
attachWebSocket(server);

server.listen(PORT, () => {
  console.log(`[server] http  http://localhost:${PORT}`);
  console.log(`[server] ws    ws://localhost:${PORT}/ws`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
