import { Router } from "express";
import { prisma } from "../prisma.js";

export const activityRouter = Router();

/* ---- GET /api/activity -------------------------------------------------- */
// Newest-first activity feed across all incidents. Optional ?take= (max 200).
activityRouter.get("/", async (req, res) => {
  const requested = Number(req.query.take);
  const take = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 200) : 50;

  const activity = await prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take,
  });
  res.json(activity);
});
