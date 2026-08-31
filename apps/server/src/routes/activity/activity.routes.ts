import { Router } from "express";
import * as activity from "./activity.controller.js";

/** `/api/activity` — the global activity feed across every incident. */
export const activityRoutes = Router();

activityRoutes.get("/", activity.getActivity);
