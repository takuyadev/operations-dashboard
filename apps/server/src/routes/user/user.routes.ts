import { Router } from "express";
import * as user from "./user.controller.js";

/**
 * `/api/user` — the current operator, plus the roster of operators who own
 * incidents. No authentication yet: the "current" operator is a fixed stub.
 */

export const userRoutes = Router();

userRoutes.get("/", user.getCurrentUser);
userRoutes.get("/list", user.getUsers);
