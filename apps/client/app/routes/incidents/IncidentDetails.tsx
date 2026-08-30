import type { Route } from "./+types/IncidentDetails";
import IssuesDetails from "@components/IssuesDetails/IssuesDetails";
import {
  addIncidentActivity,
  getIncident,
  updateIncident,
} from "../../lib/api.server";
import { CURRENT_USER_ID } from "../../lib/user";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Incident #${params.id} · Road Operations` },
    {
      name: "description",
      content: `Assessment and response for incident #${params.id}.`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const incident = await getIncident(params.id);
  return { incident, requestedId: params.id };
}

const RESPONSES = {
  dispatch: {
    status: "dispatched",
    kind: "dispatch",
    message: (label: string) => `Dispatch team notified for incident ${label}`,
  },
  resolve: {
    status: "resolved",
    kind: "resolve",
    message: (label: string) => `Incident ${label} marked resolved`,
  },
} as const;

/**
 * Records an operator action. Each `intent` is independent:
 *  - `message`  → appends a free-text entry to the incident log (no status change)
 *  - `dispatch` → status = dispatched (+ log entry)
 *  - `resolve`  → status = resolved (+ log entry)
 *  - `assign`   → assigns the incident to the current operator (+ log entry)
 * The route loader revalidates after each, so the page shows the server's version.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const message = String(form.get("message") ?? "").trim();
  const label = `#${params.id}`;

  try {
    if (intent === "message") {
      if (!message) {
        return { ok: false as const, error: "The message can't be empty." };
      }
      await addIncidentActivity(params.id, {
        kind: "message",
        message: `${CURRENT_USER_ID}: ${message}`,
        time: "just now",
      });
      return { ok: true as const, intent };
    }

    if (intent === "assign") {
      await updateIncident(params.id, {
        assignee: CURRENT_USER_ID,
        assignedToMe: true,
      });
      await addIncidentActivity(params.id, {
        kind: "assign",
        message: `${CURRENT_USER_ID} took incident ${label}`,
        time: "just now",
      });
      return { ok: true as const, intent };
    }

    if (intent === "dispatch" || intent === "resolve") {
      const plan = RESPONSES[intent];
      await updateIncident(params.id, { status: plan.status });
      await addIncidentActivity(params.id, {
        kind: plan.kind,
        message: plan.message(label),
        time: "just now",
      });
      return { ok: true as const, intent };
    }

    return { ok: false as const, error: "Unknown action." };
  } catch {
    return {
      ok: false as const,
      error: "Could not reach the incident API — nothing was sent.",
    };
  }
}

export default function IncidentDetails({ loaderData }: Route.ComponentProps) {
  return (
    <IssuesDetails
      incident={loaderData.incident}
      requestedId={loaderData.requestedId}
    />
  );
}
