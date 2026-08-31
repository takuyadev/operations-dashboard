/**
 * Small HTTP helpers shared by every resource module.
 */

/**
 * An error carrying an HTTP status. Throw it from controllers or services; the
 * app's error middleware turns it into `{ error: message }` with that status.
 *
 * @example
 * if (!incident) throw new ApiError(404, "Incident not found");
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Parse a positive-integer route param, or throw `400`. Accepts the
 * `string | string[]` shape Express 5 gives `req.params` values.
 *
 * @example
 * const id = parseId(req.params.id); // "12345" → 12345, "abc" → throws ApiError(400)
 */
export function parseId(raw: unknown, label = "id"): number {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(first);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }
  return id;
}
