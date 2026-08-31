import type { Request, Response } from "express";
import { activityService } from "./activity.service.js";

/** `GET /api/activity` */
export async function getActivity(req: Request, res: Response) {
  res.json(await activityService.getRecentActivity(Number(req.query.take)));
}
