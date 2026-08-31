/**
 * Data access for the global activity feed. Per-incident activity lives on the
 * incidents resource; this is the cross-incident view.
 */
import { prisma } from "../../lib/prisma.js";

export const activityService = {
  /**
   * Recent activity across every incident, newest first.
   * `take` is coerced to an integer and clamped to 1–200 (default 50).
   *
   * @example
   * const feed = await activityService.getRecentActivity(10);
   */
  getRecentActivity(take: number) {
    const limit = Number.isFinite(take)
      ? Math.min(Math.max(Math.trunc(take), 1), 200)
      : 50;
    return prisma.activityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
