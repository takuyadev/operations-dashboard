/**
 * Stand-in for the signed-in operator until real auth exists.
 *
 * `CURRENT_USER_ID` is the value the API's `?assignee=` filter matches against
 * the `Incident.assignee` column — currently a display name in the seed data,
 * so the placeholder is a name too. Swap this for the real session id once
 * authentication lands.
 */
export const CURRENT_USER_ID = "Kenji";

export const CURRENT_USER = {
  id: CURRENT_USER_ID,
  name: "Kenji",
  shift: "Shift C",
} as const;
