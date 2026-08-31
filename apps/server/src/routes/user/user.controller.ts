import type { Request, Response } from "express";
import { userService } from "./user.service.js";

/** `GET /api/user` */
export function getCurrentUser(_req: Request, res: Response) {
  res.json(userService.getCurrent());
}

/** `GET /api/user/list` */
export async function getUsers(_req: Request, res: Response) {
  res.json(await userService.getAll());
}
