import type { Route } from "./+types/IncidentDetails";
import IssuesDetails from "@components/IssuesDetails/IssuesDetails";
import {
  addIncidentActivity,
  getIncident,
  updateIncident,
} from "../../lib/api.server";

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
  dispatch: { status: "dispatched", kind: "dispatch" },
  resolve: { status: "resolved", kind: "resolve" },
} as const;

/**
 * Records the operator's response. Writes the status change and an activity
 * entry (carrying the dispatch note) to the API; the route loader then
 * revalidates so the page shows the server's version.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const note = String(form.get("note") ?? "").trim();

  if (intent !== "dispatch" && intent !== "resolve") {
    return { ok: false as const, error: "Unknown action." };
  }

  const plan = RESPONSES[intent];
  const label = `#${params.id}`;
  const message =
    intent === "dispatch"
      ? note
        ? `Dispatch team notified for incident ${label}: “${note}”`
        : `Dispatch team notified for incident ${label}`
      : note
        ? `Incident ${label} marked resolved: “${note}”`
        : `Incident ${label} marked resolved`;

  try {
    await updateIncident(params.id, { status: plan.status });
    await addIncidentActivity(params.id, {
      kind: plan.kind,
      message,
      time: "just now",
    });
    return { ok: true as const, intent };
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
