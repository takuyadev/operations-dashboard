/**
 * Operators. There is no `User` table yet — the "current" operator is a fixed
 * stub (no auth), and the roster is derived from the `assignee` column on
 * incidents. Swap `CURRENT_OPERATOR` for a real session lookup when auth lands.
 */
import { prisma } from "../../lib/prisma.js";

/** Mirrors the client's `app/lib/user.ts`. */
const CURRENT_OPERATOR = { id: "Kenji", name: "Kenji", shift: "Shift C" } as const;

export interface OperatorSummary {
  id: string;
  name: string;
  /** Count of this operator's incidents that are not resolved. */
  openIncidents: number;
}

export const userService = {
  /**
   * The signed-in operator.
   *
   * @example
   * userService.getCurrent(); // → { id: "Kenji", name: "Kenji", shift: "Shift C" }
   */
  getCurrent() {
    return CURRENT_OPERATOR;
  },

  /**
   * Everyone who currently owns at least one incident, with their open count.
   *
   * @example
   * await userService.getAll();
   * // → [{ id: "Kenji", name: "Kenji", openIncidents: 3 }, { id: "Tomo", name: "Tomo", openIncidents: 0 }]
   */
  async getAll(): Promise<OperatorSummary[]> {
    const rows = await prisma.incident.findMany({
      where: { assignee: { not: null } },
      select: { assignee: true, status: true },
    });

    const open = new Map<string, number>();
    for (const row of rows) {
      const name = row.assignee as string;
      open.set(name, (open.get(name) ?? 0) + (row.status === "resolved" ? 0 : 1));
    }

    return [...open.entries()]
      .map(([id, openIncidents]) => ({ id, name: id, openIncidents }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};
