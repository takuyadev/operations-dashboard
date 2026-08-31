import type { Route } from "./+types/IncidentDetails";

import { cx } from "@utilities/cx";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Button } from "@components/Button/Button";
import { Avatar } from "@components/Avatar/Avatar";
import { PriorityTag } from "@components/Tag/PriorityTag";
import { StatusTag } from "@components/Tag/StatusTag";
import { TextAreaField } from "@components/Field/Field";
import { ActivityFeed } from "@components/ActivityFeed/ActivityFeed";
import { MediaFrame } from "@components/MediaFrame/MediaFrame";
import { useIncidentResponse } from "../../hooks/useIncidentResponse";
import { formatIncidentId } from "../../data/incidents";
import type { IncidentDetail } from "../../lib/api.server";
import { CURRENT_USER_ID } from "../../lib/user";
import {
  addIncidentActivity,
  getIncident,
  updateIncident,
} from "../../lib/api.server";
import styles from "./IncidentDetails.module.css";

const BACK = { to: "/incidents", label: "Back to history" };

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
  reopen: {
    status: "unresolved",
    kind: "alert-low",
    message: (label: string) => `Incident ${label} reopened`,
  },
} as const;

/**
 * Records an operator action. Each `intent` is independent:
 *  - `message`         → appends a free-text entry to the incident log (no status change)
 *  - `dispatch`        → status = dispatched (+ log entry)
 *  - `resolve` / `reopen` → status = resolved / unresolved (+ log entry)
 *  - `assign` / `unassign` → claims / releases the incident for the current operator (+ log entry)
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

    if (intent === "assign" || intent === "unassign") {
      const take = intent === "assign";
      await updateIncident(params.id, {
        assignee: take ? CURRENT_USER_ID : null,
        assignedToMe: take,
      });
      await addIncidentActivity(params.id, {
        kind: "assign",
        message: take
          ? `${CURRENT_USER_ID} took incident ${label}`
          : `${CURRENT_USER_ID} released incident ${label}`,
        time: "just now",
      });
      return { ok: true as const, intent };
    }

    if (intent === "dispatch" || intent === "resolve" || intent === "reopen") {
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
  const { incident, requestedId } = loaderData;

  if (!incident) {
    return (
      <AppShell>
        <PageHeader title="Incident not found" back={BACK} />
        <Panel aria-label="Incident not found">
          <div className={styles.notFound}>
            <p>
              No incident matches{" "}
              <span className="mono">
                {requestedId ? `#${requestedId}` : "that address"}
              </span>
              . It may have been merged or removed.
            </p>
            <Button to={BACK.to} variant="ghost">
              Back to history
            </Button>
          </div>
        </Panel>
      </AppShell>
    );
  }

  return <IncidentView key={incident.id} incident={incident} />;
}

function IncidentView({ incident }: { incident: IncidentDetail }) {
  const {
    fetcher,
    message,
    setMessage,
    sending,
    pendingIntent,
    mine,
    isResolved,
    error,
  } = useIncidentResponse(incident);

  const idLabel = formatIncidentId(incident.id);
  const events = incident.activity ?? [];

  return (
    <AppShell>
      <PageHeader
        title={`Incident ${idLabel}`}
        back={BACK}
        meta={
          <div className={styles.tags}>
            <PriorityTag priority={incident.priority} size="lg" />
            <StatusTag status={incident.status} size="lg" />
          </div>
        }
      />

      <div className={styles.layout}>
        <Panel aria-label={`Incident ${idLabel} details`}>
          <div className={styles.work}>
            <div className={styles.assignee}>
              <Avatar name={incident.assignee ?? "Unassigned"} />
              <div className={styles.assigneeText}>
                <span className={styles.assigneeLabel}>
                  {incident.assignee ? (
                    <>
                      Assigned to <strong>{incident.assignee}</strong>
                    </>
                  ) : (
                    "Unassigned"
                  )}
                </span>
                <span className={styles.assigneeTitle}>{incident.summary}</span>
              </div>
              <fetcher.Form method="post" className={styles.assignForm}>
                <Button
                  type="submit"
                  name="intent"
                  value={mine ? "unassign" : "assign"}
                  variant="ghost"
                  icon="user"
                  disabled={sending}
                >
                  {sending &&
                  (pendingIntent === "assign" || pendingIntent === "unassign")
                    ? mine
                      ? "Releasing…"
                      : "Assigning…"
                    : mine
                      ? "Unassign"
                      : "Assign to me"}
                </Button>
              </fetcher.Form>
            </div>

            <p className={styles.description}>{incident.detail}</p>

            <fetcher.Form method="post" className={styles.messageForm}>
              <TextAreaField
                name="message"
                label="Message"
                hint="Post an update to the incident log — this does not change the status."
                placeholder="e.g. On scene, right two lanes coned off. Awaiting recovery vehicle."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={sending}
              />
              <Button
                type="submit"
                name="intent"
                value="message"
                variant="primary"
                block
                disabled={sending || message.trim() === ""}
              >
                {sending && pendingIntent === "message"
                  ? "Posting…"
                  : "Post message"}
              </Button>
            </fetcher.Form>

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <hr className={styles.divider} />

            <fetcher.Form method="post" className={styles.actions}>
              <Button
                type="submit"
                name="intent"
                value="dispatch"
                variant="dispatch"
                size="lg"
                icon="dispatch"
                disabled={isResolved || sending}
              >
                {sending && pendingIntent === "dispatch"
                  ? "Sending…"
                  : "Dispatch team"}
              </Button>
              <Button
                type="submit"
                name="intent"
                value={isResolved ? "reopen" : "resolve"}
                variant="resolve"
                size="lg"
                icon={isResolved ? "history" : "check"}
                disabled={sending}
              >
                {sending &&
                (pendingIntent === "resolve" || pendingIntent === "reopen")
                  ? "Sending…"
                  : isResolved
                    ? "Reopen incident"
                    : "Mark resolved"}
              </Button>
            </fetcher.Form>

            <hr className={styles.divider} />

            <span className={cx("label", styles.activityHeading)}>Activity</span>
            <ActivityFeed
              events={events}
              emptyMessage="No activity on this incident yet."
            />
          </div>
        </Panel>

        <aside className={styles.aside}>
          <MediaFrame
            label="Snapshot"
            status="CCTV S-118"
            placeholder="Live snapshot feed"
          />
          <MediaFrame
            label="Map"
            status={incident.location}
            placeholder="Incident location map"
          />
        </aside>
      </div>
    </AppShell>
  );
}
