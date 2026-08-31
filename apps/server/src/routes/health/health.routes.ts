import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

/** `/api/health` — liveness and database connectivity. */
export const healthRoutes = Router();

/**
 * Liveness check. Runs `SELECT 1` against Postgres, so a `200` means the API
 * process is up *and* the database is reachable.
 *
 * `GET /api/health`
 *
 * @example
 * const res = await fetch("http://localhost:4000/api/health");
 * const health = await res.json();
 * // → { status: "ok", time: "2026-08-31T09:00:00.000Z" }
 */
healthRoutes.get("/", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", time: new Date().toISOString() });
});
